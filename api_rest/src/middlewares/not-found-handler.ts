/**
 * ════════════════════════════════════════════════════════════════
 * 404 NOT FOUND HANDLER
 * ════════════════════════════════════════════════════════════════
 */

import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    message: `A rota ${req.method} ${req.path} não existe nesta API`,
    suggestion: 'Verifique a documentação em /api/docs'
  });
};
