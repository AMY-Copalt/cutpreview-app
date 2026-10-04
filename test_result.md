#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "CutPreview — Expo (RN) mobile prototype to try/customize haircuts on a stylized 3D avatar. Arabic RTL default, local-only (no backend). 3D avatar renders via three.js inside a react-native-webview (expo-gl rendered black on Android) with a 2D SVG fallback. Latest bug: Render error on HUAWEI NOVA 9 SE in Expo Go — 'undefined is not a function' at _layout.tsx NavigationBar.setButtonStyleAsync (expo-navigation-bar native fn missing in Expo Go)."

frontend:
  - task: "App opens without red screen (remove expo-navigation-bar crash)"
    implemented: true
    working: "NA"
    file: "app/_layout.tsx"
    stuck_count: 1
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Removed all expo-navigation-bar imports/calls that crashed Expo Go. White bars now handled purely via dark root View + SafeAreaProvider backgroundColor (#0A0A0A) and <StatusBar style='light' backgroundColor='#0B0B0B' translucent />. No other native-module fns used outside Expo Go (only webview, haptics(.catch), svg)."
  - task: "Editor long-press region selection on 3D head (raycasting in WebView)"
    implemented: true
    working: "NA"
    file: "src/components/avatarSceneHtml.ts, src/components/AvatarViewer3D.tsx, app/(tabs)/editor.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Long-press (~400ms, no move) raycasts region meshes and posts {type:'region'} -> RN sets selection + haptic. Drag rotates, short tap no-op. Raycast verified in a real browser earlier (top/fringe correct)."
  - task: "3D rotation recovery after background/screenshot (AppState + context loss)"
    implemented: true
    working: "NA"
    file: "src/components/AvatarViewer3D.tsx, src/components/avatarSceneHtml.ts"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "AppState->active injects window.__resume; HTML handles webglcontextlost/restored + visibilitychange and reapplies last state with a running-flag RAF loop."
  - task: "Editor split layout + smooth slider + chip bar not cut off + full-screen dark"
    implemented: true
    working: true
    file: "app/(tabs)/editor.tsx, src/components/PartEditorSheet.tsx, src/components/Slider.tsx, src/components/RegionChipBar.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "main"
        -comment: "Split layout (viewer top, panel bottom, no overlay), gesture slider smooth (0.5cm/1%), chip bar horizontally scrollable with RTL end padding, dark background. Verified on web preview."

metadata:
  created_by: "main_agent"
  version: "1.1"
  test_sequence: 0
  run_ui: true

test_plan:
  current_focus:
    - "App opens without red screen (remove expo-navigation-bar crash)"
    - "Editor long-press region selection on 3D head (raycasting in WebView)"
    - "3D rotation recovery after background/screenshot (AppState + context loss)"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: "Fixed Expo Go crash by removing expo-navigation-bar calls from app/_layout.tsx. Please test FRONTEND ONLY (no backend; app is fully local/mocked). PRIORITY 1: confirm the app loads to the avatar-picker (index) and navigates library -> editor WITHOUT any red screen / 'undefined is not a function'. PRIORITY 2 (editor): selecting a region chip (region-chip-top/fringe/sides/back) opens its controls (editor-sheet-title) and the length slider (slider-length-<region>) drags smoothly updating slider value (-value testID). PRIORITY 3: full flow index->(متابعة)->library->(select style card 'تدرج متوسط')->editor tab 'المحرر'. NOTE: On web preview the 3D WebView has no bridge so the viewer shows the 2D fallback (testID avatar-2d-fallback) after ~9s — that is EXPECTED on web, not a bug. Long-press region picking and AppState rotation-recovery are device-only (react-native-webview bridge) and cannot be exercised on web — just confirm no crashes and that chip-based selection works. Credentials: none."
