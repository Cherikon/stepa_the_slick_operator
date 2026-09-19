import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isLeaderboardConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = isLeaderboardConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

function normalizeNickname(value) {
  return value.trim().replace(/\s+/g, '_');
}

export function validateNickname(value) {
  const nickname = normalizeNickname(value);
  if (nickname.length < 3 || nickname.length > 16) {
    return { ok: false, message: 'Ник должен быть от 3 до 16 символов.' };
  }
  if (!/^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/.test(nickname)) {
    return { ok: false, message: 'Можно использовать буквы, цифры, дефис и нижнее подчеркивание.' };
  }
  return { ok: true, nickname };
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase еще не настроен. Добавь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env.');
  }
  return supabase;
}

function mapAuthError(error) {
  const message = error?.message || '';
  if (message.includes('Invalid login credentials')) return 'Неверный email или пароль.';
  if (message.includes('User already registered')) return 'Такой email уже зарегистрирован.';
  if (message.includes('Password should be')) return 'Пароль слишком короткий.';
  if (message.includes('nickname_taken')) return 'Такой ник уже занят. Придумай другой.';
  if (message.includes('invalid_nickname')) return 'Ник должен быть от 3 до 16 символов: буквы, цифры, дефис или нижнее подчеркивание.';
  if (message.includes('email_not_confirmed')) return 'В Supabase включено подтверждение почты. Отключи его в Authentication settings или подтверди email.';
  return message || 'Что-то пошло не так. Попробуй еще раз.';
}

function toPlayer(profile, user) {
  return {
    id: profile.id,
    email: user?.email || '',
    nickname: profile.nickname,
    bestScore: profile.best_score || 0
  };
}

export async function getCurrentPlayer() {
  const client = requireSupabase();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw new Error(mapAuthError(sessionError));
  const user = sessionData.session?.user;
  if (!user) return null;

  const { data: profile, error } = await client
    .from('profiles')
    .select('id,nickname,best_score')
    .eq('id', user.id)
    .single();

  if (error) throw new Error(mapAuthError(error));
  return toPlayer(profile, user);
}

export function onAuthChange(callback) {
  if (!supabase) return () => {};

  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }

    try {
      callback(await getCurrentPlayer());
    } catch {
      callback(null);
    }
  });

  return () => data.subscription.unsubscribe();
}

export async function registerPlayer({ email, password, nickname: rawNickname }) {
  const client = requireSupabase();
  const validation = validateNickname(rawNickname);
  if (!validation.ok) throw new Error(validation.message);
  if (!email.trim()) throw new Error('Введи email.');
  if (password.length < 6) throw new Error('Пароль должен быть минимум 6 символов.');

  const { data: existingProfiles, error: nicknameError } = await client
    .from('profiles')
    .select('nickname')
    .ilike('nickname', validation.nickname)
    .limit(1);

  if (nicknameError) throw new Error(mapAuthError(nicknameError));
  if (existingProfiles?.length) throw new Error('Такой ник уже занят. Придумай другой.');

  const { data: authData, error: signUpError } = await client.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        nickname: validation.nickname
      }
    }
  });

  if (signUpError) throw new Error(mapAuthError(signUpError));
  if (!authData.session) {
    throw new Error('В Supabase включено подтверждение почты. Отключи его в Authentication settings или подтверди email.');
  }

  const { data: profile, error: profileError } = await client.rpc('create_profile', {
    input_nickname: validation.nickname
  });

  if (profileError) throw new Error(mapAuthError(profileError));
  const playerProfile = Array.isArray(profile) ? profile[0] : profile;
  return toPlayer(playerProfile, authData.user);
}

export async function signInPlayer({ email, password }) {
  const client = requireSupabase();
  if (!email.trim()) throw new Error('Введи email.');
  if (!password) throw new Error('Введи пароль.');

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (error) throw new Error(mapAuthError(error));
  return getCurrentPlayer(data.user);
}

export async function signOutPlayer() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw new Error(mapAuthError(error));
}

export async function submitBestScore(player, score) {
  if (!player || score <= (player.bestScore || 0)) return player;

  const client = requireSupabase();
  const { data, error } = await client.rpc('submit_best_score', {
    input_score: score
  });

  if (error) throw new Error(mapAuthError(error));
  const profile = Array.isArray(data) ? data[0] : data;
  return {
    ...player,
    bestScore: profile?.best_score || score
  };
}

export async function loadLeaderboard() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('nickname,best_score,updated_at')
    .order('best_score', { ascending: false })
    .limit(10);

  if (error) throw new Error(mapAuthError(error));
  return data || [];
}
