import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ScoreEntry {
    distance: bigint;
    score: bigint;
    timestamp: bigint;
    playerName: string;
}
export interface backendInterface {
    getLeaderboard(): Promise<Array<ScoreEntry>>;
    getPersonalBest(playerName: string): Promise<ScoreEntry>;
    submitScore(playerName: string, score: bigint, distance: bigint): Promise<void>;
}
