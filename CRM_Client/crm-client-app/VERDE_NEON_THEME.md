# Verde Neon Theme - CRM Client

## Color Palette

### Primary Colors
- **Primary**: `#10b981` (Green-500)
- **Secondary**: `#059669` (Green-700)
- **Accent**: `#34d399` (Emerald-400)
- **Light**: `#6ee7b7` (Emerald-300)

### Backgrounds
- **Main Background**: `#000000` (Black)
- **Card Glass**: `rgba(255,255,255,0.03)` with `backdrop-filter: blur(30px)`
- **White Cards**: `bg-white/60` with backdrop-blur-xl

### Borders
- **Default**: `rgba(255,255,255,0.1)`
- **Hover**: `rgba(16,185,129,0.3)` (green)

## Common Patterns

### Headers
```jsx
<div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-lg">
  <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-gray-100/30"></div>
  <div className="relative p-6">
    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
      <Icon className="h-8 w-8 text-white" />
    </div>
    <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
      Title
    </h1>
  </div>
</div>
```

### Buttons
```jsx
// Primary Button
<button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30">

// Secondary Button
<button className="bg-white border border-gray-300 hover:bg-gray-50 text-slate-700">
```

### Cards
```jsx
<div className="relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-md">
  <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-gray-100/30"></div>
  <div className="relative p-6">
    Content
  </div>
</div>
```

### Active/Selected States
- **Background**: `bg-gradient-to-r from-green-500 to-emerald-600`
- **Shadow**: `shadow-lg shadow-green-500/30`
- **Border**: `border-green-500/30`

## Components Updated
- ✅ App.css (Global theme)
- ✅ Dashboard.jsx
- ✅ Login.jsx
- ✅ ClientLayout.jsx
- ✅ WhatsAppBotControl.jsx
- ✅ BotSettings.jsx
- 🔄 Conversations.jsx
- 🔄 Sales.jsx
- 🔄 Appointments.jsx
- 🔄 CRMVeiculos.jsx
- 🔄 Reports.jsx
