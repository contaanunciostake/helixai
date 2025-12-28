/**
 * Modal de Calculadora de Rendimento
 * Popup rapido para calculo de tintas
 */

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  Calculator, X, RefreshCw, Copy, CheckCircle, AlertTriangle
} from 'lucide-react';

import { VOLUMES } from '../TintasPages.jsx';

export default function CalculadoraModal({ isOpen, onClose }) {
  const [largura, setLargura] = useState('');
  const [altura, setAltura] = useState('');
  const [portas, setPortas] = useState(0);
  const [janelas, setJanelas] = useState(0);
  const [demaos, setDemaos] = useState(2);
  const [rendimentoPorLitro, setRendimentoPorLitro] = useState(10);
  const [volumeEmbalagem, setVolumeEmbalagem] = useState(18);
  const [resultado, setResultado] = useState(null);
  const [copied, setCopied] = useState(false);

  const calcular = () => {
    const areaTotal = parseFloat(largura) * parseFloat(altura);
    const areaPortas = portas * 1.6;
    const areaJanelas = janelas * 1.2;
    const areaUtil = areaTotal - areaPortas - areaJanelas;
    const areaPintura = areaUtil * demaos;
    const litrosNecessarios = areaPintura / rendimentoPorLitro;
    const embalagensNecessarias = Math.ceil(litrosNecessarios / volumeEmbalagem);
    const sobraLitros = (embalagensNecessarias * volumeEmbalagem) - litrosNecessarios;

    setResultado({
      areaTotal,
      areaUtil,
      areaPintura,
      litrosNecessarios: litrosNecessarios.toFixed(2),
      embalagensNecessarias,
      volumeEmbalagem,
      sobraLitros: sobraLitros.toFixed(2)
    });
  };

  const limpar = () => {
    setLargura('');
    setAltura('');
    setPortas(0);
    setJanelas(0);
    setDemaos(2);
    setResultado(null);
  };

  const copiarResultado = () => {
    if (!resultado) return;
    const texto = `Calculo de Tinta:
Area: ${resultado.areaUtil.toFixed(2)} m2
Demaos: ${demaos}
Litros necessarios: ${resultado.litrosNecessarios}L
Embalagens: ${resultado.embalagensNecessarias}x ${resultado.volumeEmbalagem}L`;

    navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-5 w-5 text-purple-400" />
            Calculadora Rapida
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Calcule a quantidade de tinta necessaria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Largura (m)</Label>
              <Input
                type="number"
                step="0.1"
                value={largura}
                onChange={(e) => setLargura(e.target.value)}
                placeholder="4.5"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Altura (m)</Label>
              <Input
                type="number"
                step="0.1"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                placeholder="2.8"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Portas</Label>
              <Input
                type="number"
                min="0"
                value={portas}
                onChange={(e) => setPortas(parseInt(e.target.value) || 0)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Janelas</Label>
              <Input
                type="number"
                min="0"
                value={janelas}
                onChange={(e) => setJanelas(parseInt(e.target.value) || 0)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Demaos</Label>
              <select
                value={demaos}
                onChange={(e) => setDemaos(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Rend. (m2/L)</Label>
              <Input
                type="number"
                step="0.5"
                value={rendimentoPorLitro}
                onChange={(e) => setRendimentoPorLitro(parseFloat(e.target.value) || 10)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Embalagem</Label>
              <select
                value={volumeEmbalagem}
                onChange={(e) => setVolumeEmbalagem(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                {VOLUMES.map(v => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={calcular}
              disabled={!largura || !altura}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calcular
            </Button>
            <Button
              onClick={limpar}
              variant="outline"
              className="bg-white/5 border-white/10 text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {resultado && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-3">
              <div className="text-center">
                <p className="text-white/60 text-sm">Voce precisa de</p>
                <p className="text-3xl font-bold text-purple-400">
                  {resultado.embalagensNecessarias}
                </p>
                <p className="text-white">
                  {resultado.embalagensNecessarias === 1 ? 'embalagem' : 'embalagens'} de {resultado.volumeEmbalagem}L
                </p>
              </div>

              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/60">Area util:</span>
                  <span className="text-white">{resultado.areaUtil.toFixed(2)} m2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Litros necessarios:</span>
                  <span className="text-purple-300">{resultado.litrosNecessarios}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Sobra estimada:</span>
                  <span className="text-green-400">{resultado.sobraLitros}L</span>
                </div>
              </div>

              <Button
                onClick={copiarResultado}
                variant="outline"
                className="w-full bg-white/5 border-white/10 text-white"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Resultado
                  </>
                )}
              </Button>

              <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Adicione 10% extra para retoques e perdas</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white/5 border-white/10 text-white"
          >
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
