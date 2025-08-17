// kvStore.js - Supabase key-value interface for React

import { createClient } from "@supabase/supabase-js";

// Create Supabase client (use env variables or .env in React)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Set a key-value pair
export const setKV = async (key, value) => {
  const { error } = await supabase.from("kv_store_bd12b0df").upsert({ key, value });
  if (error) throw new Error(error.message);
};

// Get a key-value pair
export const getKV = async (key) => {
  const { data, error } = await supabase
    .from("kv_store_bd12b0df")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.value ?? null;
};

// Delete a key-value pair
export const deleteKV = async (key) => {
  const { error } = await supabase.from("kv_store_bd12b0df").delete().eq("key", key);
  if (error) throw new Error(error.message);
};

// Set multiple key-value pairs
export const msetKV = async (keys, values) => {
  const { error } = await supabase.from("kv_store_bd12b0df").upsert(
    keys.map((k, i) => ({ key: k, value: values[i] }))
  );
  if (error) throw new Error(error.message);
};

// Get multiple key-value pairs
export const mgetKV = async (keys) => {
  const { data, error } = await supabase.from("kv_store_bd12b0df").select("value").in("key", keys);
  if (error) throw new Error(error.message);
  return data?.map((d) => d.value) ?? [];
};

// Delete multiple key-value pairs
export const mdelKV = async (keys) => {
  const { error } = await supabase.from("kv_store_bd12b0df").delete().in("key", keys);
  if (error) throw new Error(error.message);
};

// Get by prefix
export const getByPrefixKV = async (prefix) => {
  const { data, error } = await supabase
    .from("kv_store_bd12b0df")
    .select("key, value")
    .like("key", prefix + "%");
  if (error) throw new Error(error.message);
  return data?.map((d) => d.value) ?? [];
};
