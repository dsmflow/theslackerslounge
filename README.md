# The Slackers Lounge

A modern web application featuring an AI assistant powered by OpenAI's GPT-4 and voice APIs. The application provides an interactive chat interface with voice capabilities and integrates with JanusFlow through HuggingFace Spaces.

## Features

- Real-time chat with GPT-4
- Voice interactions using OpenAI's Text-to-Speech and Speech-to-Text
- JanusFlow integration via HuggingFace Spaces
- Modern, responsive UI built with React and Tailwind CSS

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and add your API keys:
   - `VITE_OPENAI_API_KEY`: Your OpenAI API key
   - `VITE_HUGGINGFACE_TOKEN`: Your HuggingFace token
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## Deployment

The application is configured for deployment on Render.com as a static site. The `render.yaml` file contains the necessary configuration.

## License

See the [LICENSE](LICENSE) file for details.