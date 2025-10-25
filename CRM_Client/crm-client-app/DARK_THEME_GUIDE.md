# Dark Theme Guide - CRM Client (Verde Neon)

## Background Principal
```jsx
className="min-h-screen bg-black text-white"
```

## Headers/Cards
```jsx
<div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-md">
  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
  <div className="relative p-6">
    {/* Content */}
  </div>
</div>
```

## Ícones nos Headers
```jsx
<div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
  <Icon className="h-8 w-8 text-white" />
</div>
```

## Títulos
```jsx
<h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
  Título
</h1>
```

## Botões Primários
```jsx
<button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-green-500/30">
  Ação
</button>
```

## Botões Secundários
```jsx
<button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/90 px-4 py-2 rounded-lg">
  Ação
</button>
```

## Cards Internos
```jsx
<div className="bg-white/5 border border-white/10 rounded-xl p-4">
  {/* Content */}
</div>
```

## Inputs
```jsx
<input className="bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg px-4 py-2 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20" />
```

## Texto
- Primary: `text-white`
- Secondary: `text-white/70`
- Muted: `text-white/50`
- Labels: `text-white/60`

## Stars Background (opcional nos componentes principais)
```jsx
{Array.from({ length: 50 }).map((_, i) => (
  <div
    key={i}
    className="fixed w-1 h-1 bg-white rounded-full pointer-events-none"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      zIndex: 0,
      animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 3}s`
    }}
  />
))}
```
