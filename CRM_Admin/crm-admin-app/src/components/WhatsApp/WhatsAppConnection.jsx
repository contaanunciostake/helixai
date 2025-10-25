/**
 * Componente WhatsAppConnection
 * @description Exibe status da conexão WhatsApp e permite conectar via QR Code
 */

import React from 'react';
import { useWhatsAppConnection } from '../../hooks/useWhatsAppConnection';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, MessageSquare, QrCode, CheckCircle2, XCircle, RefreshCw, Trash2, Bot, BotOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppConnection({ empresaId, empresaNome, botType }) {
  const connection = useWhatsAppConnection(empresaId);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-green-600" />
            <div>
              <CardTitle className="text-lg">Conexão WhatsApp</CardTitle>
              <CardDescription>{empresaNome} - Bot {botType === 'auto' ? 'Veículos' : 'Imóveis'}</CardDescription>
            </div>
          </div>

          {/* Status Badge */}
          {connection.connected ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
              <XCircle className="mr-1 h-3 w-3" />
              Desconectado
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mensagens de status/erro */}
        <AnimatePresence mode="wait">
          {connection.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  {connection.message}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {connection.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Alert className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900">
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {connection.error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR Code Display */}
        <AnimatePresence>
          {connection.qrCode && !connection.connected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-green-300 dark:border-green-800"
            >
              <QrCode className="h-8 w-8 text-green-600 mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                Escaneie este QR Code com o WhatsApp no seu celular
              </p>

              {/* QR Code Image */}
              <div className="relative">
                <img
                  src={connection.qrCode}
                  alt="WhatsApp QR Code"
                  className="w-64 h-64 rounded-lg shadow-lg"
                />
                <motion.div
                  className="absolute inset-0 border-4 border-green-500 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 text-center">
                Abra o WhatsApp no celular → Menu → Aparelhos Conectados → Conectar aparelho
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Informações de conexão */}
        {connection.connected && connection.phoneNumber && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">WhatsApp Conectado</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Número: {connection.phoneNumber.replace('@s.whatsapp.net', '')}
                  </p>
                </div>
              </div>
            </div>

            {/* Status do Bot */}
            <div className={`p-4 rounded-lg border ${connection.botAtivo ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {connection.botAtivo ? (
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <BotOff className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <div>
                    <p className={`font-medium ${connection.botAtivo ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                      Bot de Atendimento
                    </p>
                    <p className={`text-sm ${connection.botAtivo ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-400'}`}>
                      {connection.botAtivo ? 'Respondendo automaticamente' : 'Desativado'}
                    </p>
                  </div>
                </div>

                {/* Botão para ativar/desativar bot */}
                <Button
                  onClick={() => connection.toggleBot(!connection.botAtivo)}
                  disabled={connection.loading}
                  size="sm"
                  variant={connection.botAtivo ? 'outline' : 'default'}
                >
                  {connection.botAtivo ? (
                    <>
                      <BotOff className="mr-2 h-4 w-4" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Ativar Bot
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {connection.loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Processando...</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!connection.connected ? (
          <>
            <Button
              onClick={connection.connect}
              disabled={connection.loading || connection.qrCode !== null}
              className="flex-1"
            >
              <QrCode className="mr-2 h-4 w-4" />
              {connection.qrCode ? 'QR Code Gerado' : 'Conectar WhatsApp'}
            </Button>

            {connection.qrCode && (
              <Button
                onClick={connection.clearSession}
                disabled={connection.loading}
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Novo QR
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              onClick={connection.refresh}
              disabled={connection.loading}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar Status
            </Button>

            <Button
              onClick={connection.disconnect}
              disabled={connection.loading}
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Desconectar
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
