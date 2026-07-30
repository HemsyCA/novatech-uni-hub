import { supabase } from "@/integrations/supabase/client";
import type { Award, Competition, Robot, RobotCompetition, RobotOwner } from "@/types/domain";

export const listRobots = async (): Promise<Robot[]> => {
  const { data, error } = await supabase
    .from("robots")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Robot[];
};

export const listAllRobots = async (): Promise<Robot[]> => {
  const { data, error } = await supabase.from("robots").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Robot[];
};

export const createRobot = async (robot: Partial<Robot>) => {
  const { data, error } = await supabase.from("robots").insert(robot).select().single();
  if (error) throw error;
  return data as Robot;
};

export const updateRobot = async (id: string, robot: Partial<Robot>) => {
  const { error } = await supabase.from("robots").update(robot).eq("id", id);
  if (error) throw error;
};

export const deleteRobot = async (id: string) => {
  const { error } = await supabase.from("robots").delete().eq("id", id);
  if (error) throw error;
};

export const listRobotOwners = async (robotId: string): Promise<RobotOwner[]> => {
  const { data, error } = await supabase.from("robot_owners").select("*").eq("robot_id", robotId);
  if (error) throw error;
  return (data ?? []) as RobotOwner[];
};

export const addRobotOwner = async (owner: Partial<RobotOwner>) => {
  const { error } = await supabase.from("robot_owners").insert(owner);
  if (error) throw error;
};

export const removeRobotOwner = async (id: string) => {
  const { error } = await supabase.from("robot_owners").delete().eq("id", id);
  if (error) throw error;
};

export const listCompetitions = async (): Promise<Competition[]> => {
  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .order("event_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Competition[];
};

export const createCompetition = async (competition: Partial<Competition>) => {
  const { data, error } = await supabase.from("competitions").insert(competition).select().single();
  if (error) throw error;
  return data as Competition;
};

export const updateCompetition = async (id: string, competition: Partial<Competition>) => {
  const { error } = await supabase.from("competitions").update(competition).eq("id", id);
  if (error) throw error;
};

export const deleteCompetition = async (id: string) => {
  const { error } = await supabase.from("competitions").delete().eq("id", id);
  if (error) throw error;
};

export const listRobotCompetitions = async (robotId: string): Promise<RobotCompetition[]> => {
  const { data, error } = await supabase
    .from("robot_competitions")
    .select("*, competitions(*)")
    .eq("robot_id", robotId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as RobotCompetition[];
};

export const addRobotToCompetition = async (entry: { robot_id: string; competition_id: string; result?: string; notes?: string }) => {
  const { data, error } = await supabase.from("robot_competitions").insert(entry).select().single();
  if (error) throw error;
  return data as RobotCompetition;
};

export const updateRobotCompetition = async (id: string, entry: Partial<RobotCompetition>) => {
  const { error } = await supabase.from("robot_competitions").update(entry).eq("id", id);
  if (error) throw error;
};

export const removeRobotCompetition = async (id: string) => {
  const { error } = await supabase.from("robot_competitions").delete().eq("id", id);
  if (error) throw error;
};

export const listAwardsForRobotCompetition = async (robotCompetitionId: string): Promise<Award[]> => {
  const { data, error } = await supabase.from("awards").select("*").eq("robot_competition_id", robotCompetitionId);
  if (error) throw error;
  return (data ?? []) as Award[];
};

export const createAward = async (award: Partial<Award>) => {
  const { error } = await supabase.from("awards").insert(award);
  if (error) throw error;
};

export const deleteAward = async (id: string) => {
  const { error } = await supabase.from("awards").delete().eq("id", id);
  if (error) throw error;
};
