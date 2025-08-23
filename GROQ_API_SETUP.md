# Groq API Setup for AI Chatbot

## Overview
The AI Chatbot Mentor now uses Groq's API to provide real-time, intelligent career guidance. Groq offers fast, cost-effective AI responses using their optimized language models.

## Setup Instructions

### 1. Get Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy your API key (starts with `gsk_`)

### 2. Environment Configuration
Add your Groq API key to your `.env.local` file:

```env
# Groq API Configuration
GROQ_API_KEY=gsk_your_actual_api_key_here
```

### 3. API Key Security
- Never commit your API key to version control
- Keep your `.env.local` file in `.gitignore`
- Rotate your API key regularly for security

## Features

### 🤖 **Intelligent Career Mentoring**
- Personalized advice based on user's career domain
- Context-aware conversations (remembers chat history)
- Industry-specific insights and trends

### 🚀 **Fast Responses**
- Uses Groq's optimized Llama 3.1 8B model
- Sub-second response times
- Efficient token usage

### 💡 **Smart Context**
- Maintains conversation flow
- Provides domain-specific guidance
- Offers actionable career advice

## Usage Examples

Users can ask questions like:
- "What skills should I focus on for Data Science?"
- "How can I improve my resume?"
- "What are the latest trends in Web Development?"
- "How do I prepare for technical interviews?"
- "What certifications are valuable in Cybersecurity?"

## Technical Details

### API Endpoint
- **Route**: `/api/ai/chat`
- **Method**: POST
- **Model**: `llama3-8b-8192`
- **Max Tokens**: 500
- **Temperature**: 0.7 (balanced creativity)

### Conversation Context
- System prompt defines AI personality and expertise
- Maintains last 10 messages for context
- Domain-specific guidance based on user profile

### Error Handling
- Graceful fallback responses
- User-friendly error messages
- Logging for debugging

## Cost Optimization

Groq offers competitive pricing:
- **Free Tier**: Available for testing
- **Pay-as-you-go**: Only pay for what you use
- **Efficient Models**: Optimized for speed and cost

## Troubleshooting

### Common Issues

1. **"AI service not configured"**
   - Check if `GROQ_API_KEY` is set in `.env.local`
   - Restart your development server

2. **"AI service temporarily unavailable"**
   - Check Groq API status
   - Verify API key validity
   - Check rate limits

3. **Slow responses**
   - Groq typically responds in <1 second
   - Check your internet connection
   - Verify API endpoint accessibility

### Support
- Groq Documentation: [docs.groq.com](https://docs.groq.com/)
- API Status: [status.groq.com](https://status.groq.com/)
- Console: [console.groq.com](https://console.groq.com/)

## Next Steps

1. **Test the Chatbot**: Try asking career-related questions
2. **Customize Prompts**: Modify system prompts for specific use cases
3. **Monitor Usage**: Track API calls and costs in Groq console
4. **Enhance Features**: Add more specialized career guidance areas

## Security Notes

- API keys are server-side only
- No sensitive data is stored in chat history
- All communications are encrypted
- Regular security audits recommended
