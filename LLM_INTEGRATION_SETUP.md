# LLM Integration Setup Guide

## ✅ What Was Added

A new **LLM Integration** section in the API Settings page where users can:
- Choose between OpenAI, Claude (Anthropic), or Google Gemini
- Input their API key for the selected provider
- See which provider is currently active
- Switch between providers easily

## 🚀 Setup Instructions

### Step 1: Run Database Migration

Add LLM configuration columns to your database:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the contents of `supabase/migrations/add_llm_config_to_api_settings.sql`
3. Paste and click **Run**
4. You should see: "LLM configuration columns added successfully!"

### Step 2: Restart Your Dev Server

```bash
npm run dev
```

### Step 3: Configure Your LLM Provider

1. Go to http://localhost:3000/dashboard/api-settings
2. Scroll to the **LLM Integration** section
3. Click on your preferred AI provider (OpenAI, Claude, or Gemini)
4. Enter your API key
5. Click "Save Configuration"

## 🔑 Getting API Keys

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Paste into the OpenAI field

### Claude (Anthropic)
1. Go to https://console.anthropic.com/
2. Navigate to API Keys
3. Create a new key (starts with `sk-ant-`)
4. Paste into the Claude field

### Google Gemini
1. Go to https://makersuite.google.com/app/apikey
2. Create an API key
3. Copy the key (starts with `AIza`)
4. Paste into the Gemini field

## 📋 Features

✅ **Visual Provider Selection**
- Click on any provider card to select it
- Active provider is highlighted
- Shows "Configured" badge when API key is set

✅ **Secure Key Management**
- Keys are hidden by default (password field)
- Toggle visibility with eye icon
- Copy to clipboard functionality
- Stored securely in database

✅ **Active Provider Indicator**
- Badge shows which provider is connected
- Alert shows current active provider
- Easy to switch between providers

✅ **Database Integration**
- Settings persist across sessions
- Automatic loading of saved configuration
- Real-time updates

## 🔒 Security

- API keys are stored encrypted in database
- Keys are masked in the UI by default
- Row Level Security (RLS) protects data
- Only authorized users can access their keys

## 🎯 How It Works

1. **User selects a provider** (OpenAI, Claude, or Gemini)
2. **Enters their API key** for that provider
3. **Clicks Save** - key is stored in database
4. **SMS conversations** will use the selected provider
5. **Can switch providers** anytime by selecting a different one

## 🔄 Switching Providers

To switch from one provider to another:
1. Click on the new provider card
2. Enter the API key for that provider
3. Click "Save Configuration"
4. The new provider becomes active immediately

## 🧪 Testing

After setup, test by:
1. Saving an API key for your chosen provider
2. Refreshing the page
3. Verify the provider is still selected
4. Check the "Configured" badge appears
5. Send a test SMS to verify AI responses work

## 📊 Database Schema

The LLM configuration is stored in the `api_settings` table with these columns:
- `llm_provider` - 'openai', 'claude', or 'gemini'
- `llm_api_key` - The encrypted API key
- `llm_model` - Optional model specification
- `llm_is_active` - Boolean flag for active provider

## 🚀 Production Ready

This feature is ready for:
- ✅ Vercel deployment
- ✅ Multi-user environments
- ✅ Real customer usage
- ✅ Provider switching
- ✅ Secure key storage

## Next Steps

1. Run the database migration
2. Configure your preferred LLM provider
3. Test SMS conversations
4. Deploy to production
