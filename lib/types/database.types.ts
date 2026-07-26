// PLACEHOLDER — ganti file ini dengan hasil generate asli:
//   npx supabase gen types typescript --project-id <PROJECT_ID> > lib/types/database.types.ts
//
// Tipe di bawah hanya bentuk sementara supaya autocomplete tetap jalan
// sebelum kamu menjalankan migrasi & generate types dari Supabase.

export type UserRole = "donatur" | "fundraiser" | "admin";
export type CampaignType = "donasi" | "wakaf";
export type CampaignStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "completed"
  | "rejected"
  | "closed";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired";
export type WithdrawalStatus = "requested" | "approved" | "rejected" | "disbursed";
export type SalingJagaMemberStatus = "pending" | "active" | "inactive";
export type SalingJagaClaimStatus =
  | "submitted"
  | "review"
  | "approved"
  | "rejected"
  | "disbursed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      campaigns: {
        Row: {
          id: string;
          fundraiser_id: string;
          category_id: string | null;
          type: CampaignType;
          title: string;
          slug: string;
          story: string | null;
          cover_image_url: string | null;
          beneficiary_name: string | null;
          target_amount: number;
          collected_amount: number;
          deadline: string | null;
          is_urgent: boolean;
          status: CampaignStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["campaigns"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Row"]>;
      };
      donations: {
        Row: {
          id: string;
          campaign_id: string;
          donor_id: string | null;
          donor_name: string;
          is_anonymous: boolean;
          amount: number;
          message: string | null;
          payment_status: PaymentStatus;
          payment_method: string | null;
          payment_reference: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["donations"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["donations"]["Row"]>;
      };
      // TODO: tambahkan definisi Row/Insert/Update untuk tabel lain:
      // campaign_categories, campaign_updates, campaign_comments,
      // zakat_types, zakat_transactions, wakaf_programs, wakaf_transactions,
      // saling_jaga_programs, saling_jaga_members, saling_jaga_claims, withdrawals
    };
  };
}