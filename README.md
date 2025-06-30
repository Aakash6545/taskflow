# TaskFlow - Personal Productivity Companion

A modern, responsive task management application built with vanilla JavaScript featuring age verification, three-stage task workflow, and advanced data management capabilities.

## Overview

TaskFlow demonstrates proficiency in frontend development with HTML5, CSS3, and vanilla JavaScript while implementing real-world features like data persistence, API integration, and file import/export functionality.

## Key Features

### Authentication & User Management
* **Age Verification**: 10+ age requirement with real-time validation
* **User Profiles**: Dynamic avatars and personalized experience
* **Data Persistence**: LocalStorage integration for seamless sessions
* **Landing Page Shortcuts**: Enter to submit verification, Escape to clear form

### Task Management System
* **Three-Stage Workflow**: Todo → Completed → Archived
* **Priority Levels**: High, Medium, Low with automatic sorting
* **Smart Organization**: Priority-based sorting with chronological ordering
* **Real-time Operations**: Add, move, delete tasks with instant UI updates

### Advanced Features
* **Search & Filter**: Real-time search across all task stages
* **Import/Export**: JSON-based data portability with validation
* **Responsive Design**: Optimized for desktop, tablet, and mobile
* **Toast Notifications**: Real-time feedback for all user actions

## Technical Stack

* **Frontend**: HTML5, CSS3 (Tailwind), Vanilla JavaScript (ES6+)
* **Storage**: Browser LocalStorage API
* **APIs**: DummyJSON (sample data), UI Avatars (profile pictures)
* **Features**: File API, Form validation, Event delegation

## Usage

### Task Operations
* **Add**: Enter task description, select priority, click "Add Task"
* **Navigate**: Switch between Todo/Completed/Archived stages
* **Search**: Use search bar to filter tasks across all stages
* **Export/Import**: Backup and restore tasks via JSON files

### Data Management
* **Export**: Download tasks as timestamped JSON file
* **Import**: Upload JSON files with automatic validation
* **Persistence**: All data automatically saved to browser storage

### Keyboard Shortcuts
* **Landing Page**: Enter to submit verification form, Escape to clear inputs
* **Focus Management**: Smart Tab navigation between form fields

## Design Highlights

* **Modern Dark Theme**: Professional, eye-friendly interface
* **Responsive Layout**: Seamless experience across all devices
* **Intuitive UX**: Clean design focused on productivity
* **Smooth Animations**: Polished interactions and transitions

## Technical Features

* **Priority-Based Sorting**: Automatic task organization
* **Debounced Search**: Optimized real-time filtering
* **File Validation**: Secure import with size/format checks
* **Error Handling**: Comprehensive validation and user feedback
