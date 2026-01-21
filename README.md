# Team 2554 Inventory Management System

A modern React-based inventory management system built with Next.js, featuring drag-and-drop functionality, dark/light theme support, and a hierarchical container structure.

## Features

- **Hierarchical Organization**: Organize items in nested containers/locations
- **Drag & Drop**: Move items between containers with visual feedback
- **Search & Filter**: Find items quickly with search functionality
- **Theme Support**: Dark and light theme with system preference detection
- **Photo Management**: Capture and upload photos for items and locations
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Instant feedback for all operations

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Drag & Drop**: react-dnd with HTML5 backend
- **Icons**: Lucide React
- **State Management**: React Context + useReducer
- **Notifications**: Sonner
- **TypeScript**: Full type safety

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and theme variables
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Main inventory page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── modals/             # Modal components
│   ├── dnd-provider.tsx    # Drag & drop provider
│   ├── draggable-item.tsx  # Draggable item wrapper
│   ├── droppable-container.tsx # Droppable container wrapper
│   ├── folder-tree.tsx     # Hierarchical folder tree
│   ├── header.tsx          # App header with search and actions
│   ├── inventory-table.tsx # Items table with sorting and selection
│   ├── search-bar.tsx      # Search input component
│   └── theme-toggle.tsx    # Theme switcher
└── lib/
    ├── inventory-context.tsx # Inventory state management
    ├── theme-context.tsx     # Theme state management
    ├── dnd-types.ts          # Drag & drop type definitions
    ├── types.ts              # TypeScript type definitions
    └── utils.ts              # Utility functions
```

## Key Features Implementation

### Drag & Drop
- Items can be dragged from the table to containers in the sidebar
- Visual feedback during drag operations
- Automatic state updates and persistence

### Theme System
- Automatic system preference detection
- Manual theme toggle
- Persistent theme selection in localStorage

### State Management
- React Context for global state
- useReducer for complex state updates
- Optimized re-renders with proper memoization

## Development Goals

Target: Finish by launch of new season (early January)
People: Aadi, Aarit, & Neerav

### Next Steps
- Backend integration (Firestore/Google Sheets)
- Authentication system
- Real inventory data import
- Deployment setup

## Contributing

1. Ensure all functionality works as expected
2. Maintain code quality and TypeScript types
3. Test drag & drop functionality thoroughly
4. Keep the UI/UX consistent with the original design

## License

This project is part of Team 2554's internal systems.