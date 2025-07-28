# TASKS.md - Angular PDF Layout Designer Development Plan

## Phase 1: Core Infrastructure Setup

### 1.1 Component Architecture ✅ COMPLETED
- [x] Create `LayoutEditorComponent` - Main container component
- [x] Create `ToolbarComponent` - Global actions (Export PDF, layout settings)
- [x] Create `ElementPaletteComponent` - Draggable elements sidebar
- [x] Create `CanvasComponent` - Main editing area with grid
- [x] Create `GridComponent` - Grid rendering and configuration
- [x] Create `ElementComponent` - Generic component for rendering elements
- [x] Create `PropertiesInspectorComponent` - Element property editor

### 1.2 Data Model Implementation ✅ COMPLETED
- [x] Define TypeScript interfaces for:
  - `GridConfig` (columns, rows, gap, page settings)
  - `LayoutElement` (id, type, gridPosition, content/src, styles)
  - `Layout` (grid + elements array)
  - `ElementTemplate` (for element palette)
  - `GridPosition` and `ElementStyles` (supporting interfaces)
- [x] Create layout state service using RxJS observables
- [x] Implement state management for current layout

### 1.3 Routing and Module Structure
- [ ] Set up routing for the layout editor
- [ ] Create feature module for the PDF designer
- [ ] Configure lazy loading if needed

## Phase 2: Grid System Implementation

### 2.1 Basic Grid
- [ ] Implement dynamic grid rendering based on columns/rows
- [ ] Add visual grid lines (configurable visibility)
- [ ] Implement grid gap spacing
- [ ] Support different page sizes (A4, Letter, etc.)
- [ ] Handle portrait/landscape orientation

### 2.2 Grid Interactions
- [ ] Add grid configuration controls (columns/rows input)
- [ ] Implement responsive grid scaling
- [ ] Add page size selector
- [ ] Add orientation toggle

## Phase 3: Drag and Drop Foundation

### 3.1 Angular CDK Setup
- [ ] Install and configure @angular/cdk
- [ ] Import DragDropModule
- [ ] Set up basic drag/drop between palette and canvas

### 3.2 Element Palette
- [ ] Create draggable text element
- [ ] Create draggable image placeholder
- [ ] Style palette items
- [ ] Add drag preview/ghost element

## Phase 4: Canvas Element Management

### 4.1 Element Placement
- [ ] Implement drop zones on grid cells
- [ ] Calculate grid position from drop location
- [ ] Snap elements to grid
- [ ] Update layout data model on drop

### 4.2 Element Manipulation
- [ ] Implement element selection
- [ ] Add move functionality (drag existing elements)
- [ ] Add resize handles for spanning multiple cells
- [ ] Implement delete element (keyboard/button)
- [ ] Add element z-index management

### 4.3 Element Rendering
- [ ] Render text elements with basic HTML
- [ ] Render image placeholders
- [ ] Apply element styles from data model
- [ ] Handle element spanning multiple cells

## Phase 5: Properties Inspector

### 5.1 Property Panel UI
- [ ] Show properties for selected element
- [ ] Create form controls for text properties:
  - Content (rich text editor or textarea)
  - Font size
  - Color
  - Text alignment
- [ ] Create form controls for image properties:
  - Image URL/upload
  - Fit mode (cover, contain, stretch)

### 5.2 Property Binding
- [ ] Two-way binding between inspector and elements
- [ ] Real-time preview of property changes
- [ ] Validation for property values

## Phase 6: Image Handling

### 6.1 Image Upload
- [ ] Implement file upload component
- [ ] Preview uploaded images
- [ ] Store images (base64 or blob URLs)
- [ ] Add file type/size validation

### 6.2 Image Management
- [ ] Handle image placement in grid
- [ ] Implement image fit modes
- [ ] Optional: Create image library for reuse

## Phase 7: PDF Generation

### 7.1 Library Selection and Setup
- [ ] Evaluate and choose between:
  - jsPDF (HTML to PDF conversion)
  - pdfmake (declarative approach)
  - Other options from specification
- [ ] Install and configure chosen library
- [ ] Create PDF generation service

### 7.2 Export Implementation
- [ ] Convert layout data to PDF format
- [ ] Maintain accurate positioning and sizing
- [ ] Preserve image quality
- [ ] Handle text styling
- [ ] Add export button to toolbar
- [ ] Show loading/progress indicator

## Phase 8: Advanced Features

### 8.1 Layout Persistence
- [ ] Save layout to localStorage
- [ ] Load saved layouts
- [ ] Export/import layout JSON
- [ ] Optional: Backend integration for saving

### 8.2 Undo/Redo
- [ ] Implement command pattern for actions
- [ ] Add undo/redo buttons to toolbar
- [ ] Keyboard shortcuts (Ctrl+Z, Ctrl+Y)

### 8.3 Additional Elements (Optional)
- [ ] Shape elements (rectangles, circles)
- [ ] Line/divider elements
- [ ] Background colors for grid cells

## Phase 9: Testing

### 9.1 Unit Tests
- [ ] Test data model transformations
- [ ] Test grid calculations
- [ ] Test element positioning logic
- [ ] Test PDF generation service

### 9.2 Integration Tests
- [ ] Test drag and drop workflows
- [ ] Test property updates
- [ ] Test layout persistence
- [ ] Test PDF export accuracy

### 9.3 E2E Tests (Optional)
- [ ] Set up e2e testing framework
- [ ] Test complete user workflows
- [ ] Test PDF generation quality

## Phase 10: Polish and Optimization

### 10.1 UI/UX Improvements
- [ ] Add tooltips and help text
- [ ] Improve visual feedback
- [ ] Add keyboard shortcuts
- [ ] Optimize for different screen sizes

### 10.2 Performance
- [ ] Optimize rendering for large grids
- [ ] Implement virtual scrolling if needed
- [ ] Optimize PDF generation for large documents
- [ ] Add progress indicators for long operations

### 10.3 Error Handling
- [ ] Add error boundaries
- [ ] Handle failed image uploads
- [ ] Validate grid configurations
- [ ] Provide user-friendly error messages

## Development Order Recommendation

1. Start with Phase 1-2 (Infrastructure and Grid)
2. Implement Phase 3-4 (Basic Drag/Drop)
3. Add Phase 5 (Properties) for immediate feedback
4. Implement Phase 7 (PDF Export) to validate core functionality
5. Add Phase 6 (Images) to complete main features
6. Enhance with Phase 8-10 based on priorities

## Dependencies to Install

```bash
# Core functionality
npm install @angular/cdk

# PDF generation (choose one)
npm install jspdf
# OR
npm install pdfmake

# Optional for advanced grid
npm install angular-gridster2
# OR other grid library from specification

# File upload (optional)
npm install ngx-file-drop
```