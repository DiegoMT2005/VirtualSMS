# Voice AI & SMS Booking Management Platform

A comprehensive dashboard for managing voice AI agents, SMS conversations, bookings, and customer interactions. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

### 📊 Dashboard & Analytics
- Real-time metrics and KPIs
- Call volume and success rate tracking
- Revenue and cost analytics
- Conversion rate monitoring
- Interactive charts and graphs

### 📞 Call Management
- Call logs with detailed transcripts
- Call recording playback
- Sentiment analysis
- Call status tracking (completed, failed, no-answer, busy)
- Advanced filtering and search

### 💬 SMS Conversations
- SMS conversation tracking
- Message history and transcripts
- Conversation status monitoring
- Phone number search

### 📅 Appointments & Bookings
- Appointment scheduling and management
- Booking status tracking
- Customer information management
- Service type categorization
- Reminder and confirmation tracking

### 👥 Customer Management
- Customer database with contact information
- Interaction history
- Booking and call statistics
- Customer tags and notes
- Search and filtering

### 🎙️ Voice Agent Configuration
- VAPI integration settings
- Voice agent customization
- Phone number management
- Assistant configuration

### 🔧 API Settings
- VAPI API key management
- Twilio integration
- Account SID and Auth Token configuration
- Test connection functionality

### ❓ FAQ Management
- Create and manage FAQs by category
- Keyword tagging
- Usage tracking
- Active/inactive status

### 📝 System Prompts
- Voice agent system prompt editor
- SMS agent system prompt editor
- Version control
- Prompt engineering guidelines

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- VAPI account (optional)
- Twilio account (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voice-ai-booking-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key
   NEXT_PUBLIC_TWILIO_ACCOUNT_SID=your_twilio_account_sid
   NEXT_PUBLIC_TWILIO_AUTH_TOKEN=your_twilio_auth_token
   ```

4. **Set up Supabase database**
   
   Run the SQL migrations in your Supabase project (see `DATABASE_SCHEMA.md`)

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── dashboard/           # Dashboard pages
│   │   ├── analytics/       # Analytics page
│   │   ├── appointments/    # Appointments page
│   │   ├── api-settings/    # API settings page
│   │   ├── bookings/        # Bookings page
│   │   ├── call-logs/       # Call logs page
│   │   ├── calls/           # Calls page
│   │   ├── customers/       # Customers page
│   │   ├── faqs/            # FAQ management
│   │   ├── messages/        # Messages page
│   │   ├── prompts/         # System prompts editor
│   │   ├── settings/        # Settings page
│   │   ├── sms/             # SMS conversations
│   │   └── voice-agent/     # Voice agent config
│   ├── login/               # Login page
│   ├── error.tsx            # Error page
│   ├── loading.tsx          # Loading page
│   └── not-found.tsx        # 404 page
├── components/              # React components
│   ├── dashboard/           # Dashboard-specific components
│   ├── ui/                  # shadcn/ui components
│   └── error-boundary.tsx   # Error boundary component
├── lib/                     # Utility functions and hooks
│   ├── hooks/               # Custom React hooks
│   ├── supabase/            # Supabase client and helpers
│   └── utils.ts             # Utility functions
├── types/                   # TypeScript type definitions
│   └── database.ts          # Database types
└── public/                  # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Database Schema

The application uses the following main tables:

- `calls` - Call records and transcripts
- `bookings` - Appointment bookings
- `sms_messages` - SMS message history
- `customers` - Customer information
- `analytics` - Analytics data
- `faqs` - FAQ entries
- `system_prompts` - AI agent system prompts

See `DATABASE_SCHEMA.md` for detailed schema information.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

See `DEPLOYMENT.md` for detailed deployment instructions.

## Configuration

### VAPI Integration

1. Sign up for VAPI account
2. Get your API key
3. Add to `.env.local`
4. Configure voice agent in dashboard

### Twilio Integration

1. Sign up for Twilio account
2. Get Account SID and Auth Token
3. Add to `.env.local`
4. Configure phone numbers in dashboard

## Testing

See `TESTING.md` for testing guidelines and procedures.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check documentation in `/docs`
- Review `QUICKSTART.md` for common tasks

## Roadmap

- [ ] Real-time notifications
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Webhook integrations
- [ ] Custom branding options

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)
