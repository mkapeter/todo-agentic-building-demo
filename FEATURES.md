# Customer-facing features

A modern task management application that combines block-style editing with intuitive time management. Built with React 19, Express 5, and SQLite for a seamless, responsive experience across all devices.

## Task Management

### Block-Style Editing
Click anywhere to edit tasks inline with auto-save functionality. Create new tasks by pressing Enter, navigate between tasks with Tab, and use Markdown shortcuts for quick formatting. The interface feels as natural as writing in a notebook but with digital organization power.

**Entry Points:** Main task area - click any task to edit
**Limitations:** Auto-save triggers after brief typing pause

### Task Properties & Status Tracking
Each task includes a title, status (Not Started → Started → Pending → Done → Postponed → Canceled), timeframe assignment, and optional detailed notes. Track the complete task lifecycle from creation to completion with clear visual status indicators.

**Entry Points:** Task creation form, status dropdown menus
**Limitations:** Status changes are immediate with no undo functionality

### Drag & Drop Organization
Seamlessly reorder tasks within timeframes, move tasks between Today/Week/Month/Year views, and update status by dragging to status zones. Multi-select and move groups of tasks for bulk operations with smooth animations and clear visual feedback.

**Entry Points:** Drag any task to reorder or move between timeframes
**Limitations:** Touch devices may have limited multi-select functionality

## Time Management

### Timeframe Organization
Organize tasks across four distinct time horizons: Today (immediate attention), This Week (current week planning), This Month (monthly goals), and This Year (long-term objectives). Each timeframe provides focused context for different planning needs.

**Entry Points:** Sidebar navigation, timeframe selector
**Limitations:** Tasks can only belong to one timeframe at a time

### Time Management Sidebar
Collapsible sidebar sections show task counts and progress indicators for each timeframe. Quick filters for completed/pending tasks and visual completion percentage bars help track productivity across all time horizons.

**Entry Points:** Left sidebar, collapse/expand buttons
**Limitations:** Sidebar state is not persisted between sessions

### Progress Visualization
Visual completion percentage bars and progress indicators across all timeframes. See at-a-glance how you're progressing toward daily, weekly, monthly, and yearly goals with encouraging visual feedback.

**Entry Points:** Progress bars in sidebar, completion animations
**Limitations:** Progress calculations are based on task completion, not time spent

## User Experience

### Responsive Design
Works beautifully on desktop, tablet, and mobile devices with touch-friendly targets and adaptive layouts. The interface scales seamlessly across screen sizes while maintaining full functionality.

**Entry Points:** Access from any device with modern web browser
**Limitations:** Some drag-and-drop features may be limited on smaller screens

### Smooth Animations & Micro-interactions
Satisfying completion animations when marking tasks done, smooth status transition effects, hover states with subtle elevation, and loading states with skeleton placeholders. Gentle timeframe switching transitions and progressive disclosure of task details.

**Entry Points:** All task interactions, status changes, navigation
**Limitations:** Reduced motion option available for accessibility

### Modern UI Components
Built with shadcn/ui components and Tailwind CSS for a clean, modern interface. Consistent design system with proper visual hierarchy, typography that supports scanning and focus, and sufficient whitespace for cognitive comfort.

**Entry Points:** All interface elements
**Limitations:** Custom themes not yet available

## Productivity Features

### Quick Task Creation
Create tasks rapidly using block-style editing with Enter key to add new tasks below the current one. Tab navigation between tasks and Markdown shortcuts for quick formatting accelerate task capture and organization.

**Entry Points:** Press Enter in any task to create new task below
**Limitations:** No bulk import functionality available

### Keyboard Shortcuts
Power user keyboard shortcuts for efficient task management. Navigate between tasks, create new tasks, and perform common actions without reaching for the mouse.

**Entry Points:** Tab navigation, Enter for new tasks, various keyboard shortcuts
**Limitations:** Custom keyboard shortcuts not configurable

### Visual Status Indicators
Clear distinction between timeframes with consistent color coding for status indicators. Typography that supports scanning and focus with encouraging empty states that guide action.

**Entry Points:** Status indicators throughout interface
**Limitations:** Color-blind friendly mode not yet implemented

## Accessibility & Usability

### Keyboard Navigation
Full keyboard navigation support for all drag-and-drop operations. Screen reader support with descriptive labels and clear focus indicators throughout the interface.

**Entry Points:** Tab navigation, keyboard shortcuts
**Limitations:** Some advanced drag-and-drop features require mouse/touch

### Inclusive Design
High contrast mode compatibility and reduced motion options for sensitive users. Scalable text without layout breaking and simple, jargon-free interface language.

**Entry Points:** Accessibility settings (when available)
**Limitations:** Full accessibility audit not yet completed

## Technical Features

### Auto-Save Functionality
All changes are automatically saved after brief typing pauses, ensuring no work is lost. Immediate feedback for all user actions with predictable behavior across all interactions.

**Entry Points:** Automatic - no user action required
**Limitations:** No manual save option available

### Offline Capability
Basic offline functionality allows viewing and editing tasks when not connected to the internet. Changes sync when connection is restored.

**Entry Points:** Automatic - works when offline
**Limitations:** Limited offline functionality, no conflict resolution

### Data Persistence
SQLite database ensures reliable data storage with proper foreign key constraints and optimized queries. All task data is securely stored locally.

**Entry Points:** Automatic - all data persisted
**Limitations:** No cloud sync or backup functionality

## Getting Started

### Quick Setup
1. **Frontend**: Navigate to http://localhost:3000 after running `pnpm run dev` in the frontend directory
2. **Backend**: API available at http://localhost:3001/api/health after running `pnpm run dev` in the backend directory
3. **Database**: SQLite database automatically initializes on first run

### Development Commands
- **Frontend Development**: `cd frontend && pnpm run dev`
- **Backend Development**: `cd backend && pnpm run dev`
- **Build Production**: `pnpm run build` in respective directories

**Limitations:** Requires Node.js v22+ LTS and pnpm package manager

---

*Note: This application is currently in active development. Some features may be in progress or planned for future releases. Check the project status in README.md for current development phase.*
