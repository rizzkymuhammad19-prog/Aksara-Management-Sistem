import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      divisionId: string | null;
      divisionName: string | null;
      employeeId: string | null;
    };
  }
}
