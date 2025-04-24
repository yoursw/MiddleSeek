# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# MiddleSeek

MiddleSeek is an AI-powered chatbot application designed to help users find balanced perspectives and middle ground on various topics. The app uses OpenAI's GPT model and can load custom prompts from GitHub repositories.

## Features

- AI-powered chat interface
- Remote prompt loading from GitHub
- Real-time message updates
- Clean and intuitive UI
- Cross-platform support (iOS, Android, Web)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=your_api_key_here
   ```
4. Update the GitHub repository and prompt path in `app/chat.tsx`:
   ```typescript
   const GITHUB_REPO = 'your-username/middleseek';
   const PROMPT_PATH = 'prompts/base-prompt.txt';
   ```

## Running the App

- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

## Customizing the Base Prompt

The base prompt is loaded from a GitHub repository. To customize it:

1. Fork this repository
2. Modify the `prompts/base-prompt.txt` file
3. Update the `GITHUB_REPO` constant in `app/chat.tsx` to point to your repository

## License

This project is licensed under the AGPLv3 License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
