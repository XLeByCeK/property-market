import { Router } from 'express';

declare module './routes/properties' {
  const router: Router;
  export default router;
}

declare module './routes/chat' {
  const router: Router;
  export default router;
}

declare module './routes/auth' {
  const router: Router;
  export default router;
} 