# TidyGuru

**Transform messy sales data into clean insights**

TidyGuru is a modern SaaS analytics dashboard that helps creators, indie founders, and small teams analyze their sales data without complexity. Simply upload your CSV and see instant insights.

## Features

- 📊 **Instant Analytics** - Upload CSV and see metrics in seconds
- 📈 **Beautiful Charts** - Revenue trends and top products visualization
- 🔍 **Smart Search** - Quickly find transactions in your data
- 📥 **Export Reports** - Download as PDF or CSV
- 🎨 **Modern UI** - Clean, responsive design with dark mode support
- 🔐 **Privacy First** - All processing happens in your browser

## Supported Platforms

Works with CSV exports from:
- Shopify
- Gumroad
- Whop
- Etsy
- And more!

## Tech Stack

This project is built with:

- **Vite** - Fast build tool
- **TypeScript** - Type-safe code
- **React 18** - Modern UI framework
- **shadcn/ui** - Beautiful component library
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **PapaParse** - CSV parsing
- **jsPDF** - PDF generation

## Getting Started

### Prerequisites

- Node.js 18+ & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd TidyGuru

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Available Scripts

```sh
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Project Structure

```
TidyGuru/
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # shadcn-ui component library
│   │   └── ...         # Custom components
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions (CSV parser, PDF exporter)
│   ├── hooks/          # Custom React hooks
│   └── assets/         # Static assets
├── public/             # Public static files
└── dist/              # Production build output
```

## Key Metrics Tracked

- **Gross Sales** - Total sales amount
- **Refunds** - Total refund amount
- **Net Revenue** - Sales minus refunds and fees
- **Orders** - Total number of orders
- **Average Order Value** - Average transaction size

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub.
