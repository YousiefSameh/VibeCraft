# VibeCraft: AI-Powered Website Builder 🎨

VibeCraft is a cutting-edge AI-powered website builder that combines the latest web technologies with artificial intelligence to streamline the website creation process. Build, deploy, and manage beautiful websites with the power of AI.

## ✨ Key Features

- 🚀 **Next.js 15 + React 19** - Latest framework versions for optimal performance
- 🎨 **Tailwind v4 + Shadcn/ui** - Modern, responsive UI components
- 📡 **tRPC** - End-to-end type safety for your API
- 🔁 **Inngest Background Jobs** - Reliable background task processing
- 🧠 **Inngest Agent Toolkit** - AI-powered automation tools
- 🔐 **Clerk Authentication** - Secure user authentication and management
- 💳 **Clerk Billing** - Integrated payment and subscription handling
- 🧱 **AI Component Generation** - Create components from natural language prompts
- 🗂️ **Live Preview** - Real-time project preview with public URL access
- 🖥️ **E2B Cloud Sandboxes** - Secure runtime execution environment
- 🐳 **Docker Templates** - Containerized sandbox environments
- 🧠 **AI Model Integration** - Support for various AI models
- 📦 **Prisma + Neon** - Type-safe database operations with serverless PostgreSQL
- 🧾 **Credit System** - Built-in usage tracking and management
- 🧪 **Preview Mode** - Toggle between preview and code explorer

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📚 Documentation

- **Configuration**: Edit `app/page.tsx` to modify the main page
- **Styling**: Uses Tailwind CSS for styling with Shadcn/ui components
- **Database**: Prisma ORM with Neon serverless PostgreSQL
- **Authentication**: Clerk for user management and auth
- **Background Jobs**: Inngest for reliable task processing

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **Backend**: tRPC, Prisma, Neon PostgreSQL
- **Authentication**: Clerk
- **AI Integration**: Various AI models, CodeRabbit
- **Infrastructure**: E2B Cloud, Docker
- **Background Processing**: Inngest

## 🔒 Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your-neon-database-url"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# E2B
E2B_API_KEY=

# Other configurations...
```

## Contributing
We welcome contributions to improve **Vibe Craft**! To contribute, follow these steps:

1. **Fork the Repository**:
  Click the "Fork" button on the top right corner of the repository page to create a copy of the repository in your GitHub account.

2. **Clone Your Fork**:
  Clone your forked repository to your local machine:
  ```bash
  git clone https://github.com/YousiefSameh/VibeCraft.git
  cd VibeCraft
  ```

3. **Create a Branch**:
  Create a new branch for your feature or bug fix:
  ```bash
  git checkout -b feature/your-feature-name
  ```

4. **Make Changes**:
  Implement your changes in the codebase. Ensure your code adheres to the project's coding standards.

5. **Test Your Changes**:
  Run the application and any relevant tests to verify your changes.

6. **Commit Your Changes**:
  Commit your changes with a descriptive commit message:
  ```bash
  git commit -m "Add feature: your-feature-name"
  ```

7. **Push to Your Fork**:
  Push your branch to your forked repository:
  ```bash
  git push origin feature/your-feature-name
  ```

8. **Open a Pull Request**:
  Go to the original repository and open a pull request. Provide a clear description of your changes and link any related issues.


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


---

Built with ❤️ by me