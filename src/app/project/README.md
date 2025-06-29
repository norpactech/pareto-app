# Project Module

This module provides comprehensive project management functionality for the Pareto application with a hierarchical structure supporting Projects, Project Components, and Project Component Properties.

## Features

- **Project List**: View all projects with search, filtering, and pagination
- **Project Details**: View detailed information about a specific project
- **Project Form**: Create new projects or edit existing ones
- **Project Management**: Comprehensive master-detail view for managing entire project hierarchies
- **Status Management**: Activate/deactivate projects, components, and properties
- **Responsive Design**: Mobile-friendly interface

## Hierarchical Structure

1. **Project** - Root level containing basic project information
2. **Project Component** - Child of Project, represents components within a project
3. **Project Component Property** - Child of Project Component, represents properties of components

## Components

### ProjectListComponent
- Displays projects in a data table with pagination
- Search functionality across multiple fields (name, description, domain, artifact)
- Filter by active/inactive status
- Quick access to management interface

### ProjectDetailComponent
- Shows comprehensive project information
- Displays audit trail (created/updated by and when)
- Status management controls
- Navigation to edit mode

### ProjectFormComponent
- Unified form for creating and editing projects
- Form validation with error messages
- Responsive layout with organized sections
- Auto-save and cancel functionality

### ProjectManagementComponent ⭐ **NEW**
- **Master-detail interface** for complete project hierarchy management
- Side-by-side view with project list and detailed management panel
- **Single-screen experience** for managing projects, components, and properties
- Breadcrumb navigation between hierarchy levels
- In-place editing for all entity types
- Real-time updates and synchronized views

## Routing

- `/project` - Project list (default)
- `/project/manage` - **Comprehensive management interface** ⭐
- `/project/new` - Create new project
- `/project/:id` - View project details
- `/project/:id/edit` - Edit existing project

## User Experience Optimization

The module is designed to **minimize screen navigation** by providing:

1. **Combined Master-Detail Views**: The management interface shows project list alongside detailed editing panels
2. **Hierarchical Navigation**: Breadcrumb system allows quick navigation between Project → Component → Property levels
3. **In-place Editing**: Edit forms appear within the same interface without navigation
4. **Contextual Actions**: Add/edit/delete operations are available at the appropriate hierarchy level
5. **Real-time Updates**: Changes are immediately reflected across all views

## Services Used

- `ProjectService` - CRUD operations for projects
- `ProjectComponentService` - CRUD operations for project components
- `ProjectComponentPropertyService` - CRUD operations for component properties
- `AuthGuard` - Route protection
- Angular Material components for UI

## Models

### IProject
- Basic information (id, name, description)
- Schema details (idSchema, schemaName)
- Technical details (domain, artifact)
- Audit information (created/updated by/at)
- Status (isActive)

### IProjectComponent
- Linked to parent project (idProject)
- Context and plugin references (idContext, idPlugin)
- Component details (name, description, subPackage)
- Audit information and status

### IProjectComponentProperty
- Linked to parent component (idProjectComponent)
- Sequence and filter properties
- Data object and property filters
- Audit information and status

## Usage

The module is lazy-loaded and can be accessed via:
- Main navigation menu → "Projects"
- Dashboard → "Projects" card
- Direct navigation to `/project/manage`

All routes are protected by authentication guards.

## Responsive Design

The module includes responsive breakpoints for:
- Desktop (full feature set with side panel)
- Tablet (condensed layout)
- Mobile (stacked interface, full-screen panels)
