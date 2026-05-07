# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


========================================================================
COZY COFFEE PROJECT - SETUP GUIDE & DOCUMENTATION
========================================================================

1. PREREQUISITES
------------------------------------------------------------------------
* Node.js: Version 22.12.0 or higher (CRITICAL for Vite/Rolldown)
  - Download from: https://nodejs.org/
  - Verify with: node -v
* Browser: Chrome, Edge, or Firefox

2. FOLDER NAVIGATION
------------------------------------------------------------------------
The React code lives in the 'test-app' subfolder. Always ensure your 
terminal is pointing there before running commands.

Command: cd "D:\Personal Projects\CMSC127\CMSC-127-Project-Cozy-Cafe-Admin\test-app"

3. INSTALLATION (NEW PC SETUP)
------------------------------------------------------------------------
If you just cloned the project or moved to a new PC:

Step A: Clear old/broken files (PowerShell)
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json

Step B: Install dependencies
   npm install

4. ENVIRONMENT VARIABLES (.env)
------------------------------------------------------------------------
Create a file named '.env' inside the 'test-app' folder. 
Paste the following (replacing keys as needed):

VITE_SUPABASE_URL=https://mbnvxovppbbybjtznqfg.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_public_key_here

# Required for Transaction Logic
VITE_TX_REFERENCE_ID=1
VITE_TX_CASHIER_ADMIN_ID=1

# Compatibility Fallbacks
SUPABASE_URL=https://mbnvxovppbbybjtznqfg.supabase.co
SUPABASE_KEY=your_actual_anon_public_key_here

5. RUNNING THE APPLICATION
------------------------------------------------------------------------
Run this command from the 'test-app' folder:

   npm run dev

Once running, click the link or go to: http://localhost:5173

6. PROJECT STRUCTURE
------------------------------------------------------------------------
- /src/App.jsx       : Main Routing (Switches between Admin/Customer)
- /src/customer.jsx  : Customer Menu UI
- /src/InventoryDashboard.jsx : Admin Inventory Management
- /supabase.js       : Connection config for the database

7. TROUBLESHOOTING
------------------------------------------------------------------------
* "Missing Script: dev": You are in the wrong folder. 'cd test-app'.
* "Native Binding Error": Your Node.js version is too old. Upgrade 
  to 22.12+ and delete node_modules, then 'npm install'.
* "Supabase URL missing": Your .env file is missing 'VITE_' prefix 
  or is in the wrong folder. Move .env to 'test-app'.

========================================================================
Generated on: 2024-05-07
========================================================================