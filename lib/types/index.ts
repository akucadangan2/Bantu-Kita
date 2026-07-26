export type {
  UserRole,
  CampaignType,
  CampaignStatus,
  PaymentStatus,
  WithdrawalStatus,
  SalingJagaMemberStatus,
  SalingJagaClaimStatus,
  Database,
} from "./database.types";

export type Profile = import("./database.types").Database["public"]["Tables"]["profiles"]["Row"];
export type Campaign = import("./database.types").Database["public"]["Tables"]["campaigns"]["Row"];
export type Donation = import("./database.types").Database["public"]["Tables"]["donations"]["Row"];
