#!/bin/bash

# Environment Switch Script for TodoRN
# Usage: ./scripts/env-switch.sh [mock|dev|prod]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  TodoRN Environment Switcher${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [mock|dev|prod]"
    echo ""
    echo "Available environments:"
    echo "  mock  - Mock environment (local storage, simulated API)"
    echo "  dev   - Development environment (dev API server)"
    echo "  prod  - Production environment (production API server)"
    echo ""
    echo "Examples:"
    echo "  $0 mock    # Switch to mock environment"
    echo "  $0 dev     # Switch to development environment"
    echo "  $0 prod    # Switch to production environment"
}

# Function to check if environment is valid
is_valid_environment() {
    case $1 in
        mock|dev|prod)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to get environment name
get_env_name() {
    case $1 in
        mock)
            echo "mock"
            ;;
        dev)
            echo "development"
            ;;
        prod)
            echo "production"
            ;;
    esac
}

# Function to get environment display name
get_env_display_name() {
    case $1 in
        mock)
            echo "Mock Environment"
            ;;
        dev)
            echo "Development Environment"
            ;;
        prod)
            echo "Production Environment"
            ;;
    esac
}

# Function to get environment description
get_env_description() {
    case $1 in
        mock)
            echo "Uses local storage and simulated API responses for development and testing"
            ;;
        dev)
            echo "Connects to development API server with debugging enabled"
            ;;
        prod)
            echo "Connects to production API server with optimized settings"
            ;;
    esac
}

# Function to get environment color
get_env_color() {
    case $1 in
        mock)
            echo "#6750A4"
            ;;
        dev)
            echo "#4CAF50"
            ;;
        prod)
            echo "#FFFFFF"
            ;;
    esac
}

# Main function
main() {
    print_header

    # Check if environment argument is provided
    if [ $# -eq 0 ]; then
        print_error "No environment specified"
        show_usage
        exit 1
    fi

    ENV=$1

    # Validate environment
    if ! is_valid_environment $ENV; then
        print_error "Invalid environment: $ENV"
        show_usage
        exit 1
    fi

    # Get environment details
    ENV_NAME=$(get_env_name $ENV)
    ENV_DISPLAY=$(get_env_display_name $ENV)
    ENV_DESC=$(get_env_description $ENV)
    ENV_COLOR=$(get_env_color $ENV)

    print_status "Switching to $ENV_DISPLAY"
    print_status "Description: $ENV_DESC"
    print_status "Color: $ENV_COLOR"

    # Set environment variable
    export EXPO_PUBLIC_ENVIRONMENT=$ENV_NAME
    print_status "Set EXPO_PUBLIC_ENVIRONMENT=$ENV_NAME"

    # Show available commands
    echo ""
    print_status "Available commands for $ENV_DISPLAY:"
    echo ""
    echo "  npm run start:$ENV      # Start development server"
    echo "  npm run android:$ENV    # Run on Android"
    echo "  npm run ios:$ENV        # Run on iOS"
    echo "  npm run web:$ENV        # Run on Web"
    echo "  npm run build:$ENV      # Build for this environment"
    echo ""

    # Show current environment info
    print_status "Current environment configuration:"
    echo "  Environment: $ENV_DISPLAY"
    echo "  API Mode: $(if [ "$ENV" = "mock" ]; then echo "Mock (Local)"; else echo "Real (API Server)"; fi)"
    echo "  Debug: $(if [ "$ENV" = "prod" ]; then echo "Disabled"; else echo "Enabled"; fi)"
    echo "  Analytics: $(if [ "$ENV" = "mock" ]; then echo "Disabled"; else echo "Enabled"; fi)"
    echo "  Crash Reporting: $(if [ "$ENV" = "mock" ]; then echo "Disabled"; else echo "Enabled"; fi)"
    echo "  Push Notifications: $(if [ "$ENV" = "prod" ]; then echo "Enabled"; else echo "Disabled"; fi)"
    echo ""

    # Show next steps
    print_status "Next steps:"
    echo "  1. Restart your development server if it's running"
    echo "  2. Run: npm run start:$ENV"
    echo "  3. Check the console for environment logs"
    echo ""

    print_status "Environment switch complete! 🎉"
}

# Run main function with all arguments
main "$@" 