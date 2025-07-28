# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `ng serve` or `npm start` - Start local development server on http://localhost:4200/
- `ng build` or `npm run build` - Build the project (output to `dist/`)
- `ng test` or `npm test` - Run unit tests with Karma
- `ng generate component component-name` - Generate new components

### Testing
- `ng test` - Run unit tests with Karma test runner
- `ng test --no-watch --code-coverage` - Run tests once with coverage report

Note: No linting or formatting commands are currently configured.

## Architecture Overview

This is an Angular 19 application for designing and exporting PDF layouts. The app provides a drag-and-drop interface for creating PDF documents using a grid-based layout system.

### Key Features
1. **Grid Layout System**: Customizable grid with dynamic rows/columns where elements can span multiple cells
2. **Element Types**: Text blocks and image placeholders that can be dragged onto the canvas
3. **PDF Export**: Converts the designed layout to PDF format

### Data Model
The application state is represented as a JSON structure with:
- `grid`: Configuration for columns, rows, gap, and page dimensions
- `elements`: Array of layout elements, each containing:
  - `type`: "text" or "image"
  - `gridPosition`: Start/end columns and rows
  - `content`/`src`: Element-specific data
  - `styles`: Visual properties

### Component Structure (Planned)
- **AppComponent**: Root component
- **LayoutEditorComponent**: Main designer container
- **CanvasComponent**: Grid and element rendering with drag-drop
- **ElementPaletteComponent**: Draggable element library
- **PropertiesInspectorComponent**: Element property editor

### Technology Stack
- Angular 19 with Server-Side Rendering (SSR)
- TypeScript 5.7
- RxJS for reactive programming
- Karma/Jasmine for testing

### Recommended Libraries (Not Yet Implemented)
- **PDF Generation**: jsPDF or pdfmake
- **Grid/Drag-Drop**: Angular CDK DragDropModule, angular-grid-layout
- **File Upload**: ngx-file-drop or HTML5 file input

## Workflow Reminders
- Remember to update TASKS.md whenever you complete a task or find out we need to add more
- After changes make sure to run 'ng build' after changes