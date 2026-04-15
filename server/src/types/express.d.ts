declare global {
  namespace Express {
    interface User {
      id: string;
      roleSlug: string;
      companyId?: string | null;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
