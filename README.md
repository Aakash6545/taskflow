# TaskFlow - Personal Productivity Companion

A modern, responsive todo application built with vanilla JavaScript that helps users manage tasks across different stages (Todo, Completed, Archived). This project demonstrates proficiency in HTML5, CSS3, and JavaScript while implementing age verification, data persistence, and API integration.

## 🎯 Project Overview

TaskFlow was developed as a comprehensive frontend assignment to showcase skills in:
- Building responsive web interfaces using HTML/CSS
- Implementing dynamic functionality with Vanilla JavaScript
- Working with browser localStorage for data persistence
- Integrating with external APIs
- Handling form validation and user input
- Managing application state and user flow

## ✨ Features

### Landing Page (Age Verification)
- **Age Verification System**: Users must be over 10 years old to access the application
- **Form Validation**: Real-time validation for name and date of birth inputs
- **Data Persistence**: User information stored in localStorage
- **Auto-Redirect**: Returning users are automatically redirected to the main app
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Priority-Based Sorting**: Tasks automatically sorted by priority (High → Medium → Low)
- **Chronological Organization**: Within each priority level, older tasks appear first

### Main Application (Task Management)
- **User Profile Display**: Shows user name and dynamically generated avatar
- **Three-Stage Task Management**:
  - **Todo**: Active tasks that need completion
  - **Completed**: Finished tasks
  - **Archived**: Tasks kept for reference
- **Dynamic Task Operations**:
  - Add new tasks with validation
  - Move tasks between stages
  - Real-time task counters
  - Last modified timestamps
- **Initial Data Loading**: Populates with dummy data from external API on first visit
- **Sign Out Functionality**: Clears data and returns to landing page

## 🛠️ Technical Implementation

### Technology Stack
- **HTML5**: Semantic markup and structure
- **CSS3**: Custom styling with Tailwind CSS framework
- **Vanilla JavaScript**: ES6+ features for dynamic functionality
- **LocalStorage API**: Client-side data persistence
- **External APIs**: DummyJSON for initial data, UI Avatars for profile pictures

### API Integrations
- **DummyJSON Todos API**: `https://dummyjson.com/todos`
  - Fetches initial dummy tasks on first app visit
  - Transforms API data to match application structure
- **UI Avatars API**: `https://ui-avatars.com/api/`
  - Generates user profile pictures dynamically
  - Parameters: `?background=0D8ABC&color=fff&name={USER_NAME}`

### Data Management
- **LocalStorage Persistence**: All user data and tasks persist across browser sessions
- **State Management**: Efficient handling of task states and user flow
- **Data Validation**: Comprehensive input validation and error handling

## 📁 Project Structure

```
TaskFlow/
├── index.html          # Landing page with age verification
├── index.js           # Landing page functionality and validation
├── app.html           # Main task management dashboard
├── app.js             # Core application logic and task management
└── README.md          # Project documentation
```

## 📖 How to Use

### Initial Setup
1. **Age Verification**: Enter your full name and date of birth
2. **Validation**: System ensures you're over 10 years old
3. **Access**: Automatic redirect to the main application

### Task Management
1. **Adding Tasks**: Type your task description and click "Add Task"
2. **Task Prioritization**: Tasks are automatically sorted by priority (High → Medium → Low), with older tasks appearing first within each priority level
3. **Managing Stages**:
   - **Todo → Completed**: Mark tasks as finished
   - **Todo → Archived**: Archive tasks directly
   - **Completed → Archived**: Move completed tasks to archive
   - **Any Stage → Todo**: Restore tasks to active status
4. **Navigation**: Switch between Todo, Completed, and Archived views
5. **Tracking**: View real-time task counts and last modified timestamps

## 🎨 Design Philosophy

### User Experience Principles
- **Clean Interface**: Minimalist design focused on productivity
- **Intuitive Navigation**: Clear visual hierarchy and user flow
- **Responsive Design**: Optimized for all screen sizes
- **Smooth Interactions**: Polished animations and transitions

### Visual Design
- **Modern Dark Theme**: Easy on the eyes with professional aesthetics
- **Priority-Based Organization**: Clear visual distinction between task stages
- **Consistent Branding**: Cohesive design language throughout the application

## 🔧 Key Features Implementation

### Age Verification System
- Date picker validation
- Real-time age calculation
- User-friendly error messaging
- Secure access control

### Task Stage Management
- Dynamic stage switching
- Real-time counter updates
- Persistent state management
- Intuitive task operations
- **Priority-Based Sorting**: Tasks automatically sorted by priority (High → Medium → Low)
- **Chronological Organization**: Within each priority level, older tasks appear first

### Data Persistence
- LocalStorage integration
- Session management
- Data validation and error handling

## ⭐ Bonus Features Implemented
- **Priority Levels**: High, Medium, Low priority classification
- **Smart Task Sorting**: Tasks are sorted by priority (High → Medium → Low), with chronologically older tasks appearing first within each priority level
- **Enhanced Animations**: Smooth transitions and loading states
- **Toast Notifications**: Real-time feedback for user actions
