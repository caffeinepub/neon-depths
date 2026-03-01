import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import List "mo:core/List";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";

actor {
  type ScoreEntry = {
    playerName : Text;
    score : Nat;
    distance : Nat;
    timestamp : Int;
  };

  let entries = List.empty<ScoreEntry>();
  let maxEntries = 100;

  module ScoreEntry {
    public func compareByScoreDescending(a : ScoreEntry, b : ScoreEntry) : Order.Order {
      Nat.compare(b.score, a.score);
    };
  };

  public shared ({ caller }) func submitScore(playerName : Text, score : Nat, distance : Nat) : async () {
    if (playerName.size() == 0) {
      Runtime.trap("Player name cannot be empty");
    };

    let newEntry : ScoreEntry = {
      playerName;
      score;
      distance;
      timestamp = Time.now();
    };

    entries.add(newEntry);

    // Sort entries by score descending
    var entryArray = entries.toArray();
    entryArray := entryArray.sort(ScoreEntry.compareByScoreDescending);

    // Clear and refill the List with sorted entries
    entries.clear();
    for (entry in entryArray.values()) {
      entries.add(entry);
    };

    // Trim to maxEntries
    if (entries.size() > maxEntries) {
      let trimmed = entries.toArray().sliceToArray(0, maxEntries);
      entries.clear();
      for (entry in trimmed.values()) {
        entries.add(entry);
      };
    };
  };

  public query ({ caller }) func getLeaderboard() : async [ScoreEntry] {
    // Return the top 10 entries
    let result = entries.toArray();
    if (result.size() <= 10) {
      result;
    } else {
      result.sliceToArray(0, 10);
    };
  };

  public query ({ caller }) func getPersonalBest(playerName : Text) : async ScoreEntry {
    let filteredEntries = entries.toArray().filter(
      func(entry) {
        entry.playerName == playerName;
      }
    );

    if (filteredEntries.size() == 0) {
      Runtime.trap("No entries found for player " # playerName);
    };

    var bestEntry = filteredEntries[0];
    for (entry in filteredEntries.values()) {
      if (entry.score > bestEntry.score) {
        bestEntry := entry;
      };
    };
    bestEntry;
  };
};
