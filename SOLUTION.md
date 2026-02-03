# Solution Design Document

## Project Overview

TaskHandler is a full-stack task management application designed with a clean separation between frontend and backend, utilizing modern web technologies and best practices.

---

## Architecture

### High-Level Architecture

```
┌─────────────────┐         HTTP/REST API        ┌─────────────────┐
│                 │ ◄─────────────────────────►  │                 │
│  Angular SPA    │            JSON DTO          │  .NET Web API   │
│  (Frontend)     │                              │  (Backend)      │
│                 │                              │                 │
└─────────────────┘                              └────────┬────────┘
                                                          │
                                                          ▼
                                                  ┌──────────────-┐
                                                  │   In-Memory   │
                                                  │  or PostgreSQL│
                                                  └──────────────-┘
```

### Technology Stack

**Frontend:**
- Angular 21 (Standalone Components)
- TypeScript 5.9
- RxJS 7.8
- Angular Signals for state management
- Custom rich-text editor

**Backend:**
- .NET 10 Web API
- Entity Framework Core (optional PostgreSQL)
- In-Memory data store (default)
- ProblemDetails for standardized error responses

---

## Design Decisions

### 1. Frontend Architecture

#### Component-Based Design
**Decision:** Used Angular standalone components for all UI elements.

**Rationale:**
- Simplified module management
- Better tree-shaking and smaller bundle sizes
- Improved developer experience with less boilerplate

**Trade-offs:**
- ✅ Pros: Cleaner code, faster builds, easier testing
- ⚠️ Cons: Requires Angular 14+ knowledge

#### State Management with Signals
**Decision:** Utilized Angular Signals instead of traditional RxJS Observables for local component state.

**Rationale:**
- Built-in reactivity without additional libraries
- Better performance with fine-grained updates
- Simpler mental model for state changes

**Trade-offs:**
- ✅ Pros: Native framework feature, no external dependencies, improved change detection
- ⚠️ Cons: Newer API (Angular 16+)

#### Rich Text Editor
**Decision:** Implemented a custom rich-text editor using `contenteditable` and `document.execCommand`.

**Rationale:**
- No external dependencies (Quill, TinyMCE, etc.)
- Full control over UI/UX and styling
- Lightweight solution for basic formatting needs

**Trade-offs:**
- ✅ Pros: Zero bundle size overhead, customizable, consistent with app design
- ⚠️ Cons: Limited features vs. full-fledged editors, `execCommand` is deprecated (but still widely supported)
- 💡 Future: Could migrate to modern `document.selection` API or external library for advanced features

### 2. UI/UX Design

#### Expandable Task Items
**Decision:** Tasks can expand to show additional details (description, full status/priority, creation date).

**Rationale:**
- Reduces visual clutter on list view
- Progressive disclosure of information
- Better mobile responsiveness

**Trade-offs:**
- ✅ Pros: Cleaner interface, better information hierarchy
- ⚠️ Cons: Requires extra click to see details

#### Color-Coded Status/Priority
**Decision:** Used consistent color scheme across badges, icons, and dropdowns:
- Blue: New status / Low priority
- Yellow/Orange: In Progress / Medium priority
- Green: Done status
- Red: High priority

**Rationale:**
- Visual consistency improves cognitive load
- Colors aligned with common UI patterns (green=success, red=urgent)

**Trade-offs:**
- ✅ Pros: Intuitive, accessible, consistent
- ⚠️ Cons: May need adjustment for color-blind users (could add patterns/icons)

#### Modal-Based CRUD Operations
**Decision:** Used modals for create, edit, filter, and delete operations.

**Rationale:**
- Keeps user in context without page navigation
- Consistent interaction pattern
- Draggable modals for flexibility

**Trade-offs:**
- ✅ Pros: Better UX, no routing complexity, maintains scroll position
- ⚠️ Cons: Not ideal for deep-linking to specific tasks (could add URL state if needed)

### 3. Backend Architecture

#### ProblemDetails Error Handling
**Decision:** Implemented RFC 7807 ProblemDetails for all error responses.

**Rationale:**
- Standardized error format
- Better client-side error handling


**Trade-offs:**
- ✅ Pros: Industry standard, consistent structure, helpful for debugging
- ⚠️ Cons: Slightly more complex than simple error strings

#### In-Memory Storage (Default)
**Decision:** Default to in-memory data store with optional PostgreSQL support.

**Rationale:**
- Quick setup for development/demos
- No database configuration required
- Easy to switch to PostgreSQL when needed

**Trade-offs:**
- ✅ Pros: Zero configuration, fast development, no dependencies
- ⚠️ Cons: Data lost on restart, not production-ready without database
- 💡 Note: PostgreSQL support documented and available via configuration
```
"Database": {
    //"Provider": "Npgsql"
    "Provider": "InMemory"
  }
```

#### Provider-Aware Search Behavior
**Decision:** Implement provider-aware text search in the repository layer.

**Rationale:**
- `EF.Functions.ILike(...)` is PostgreSQL-specific (Npgsql).
- The application supports multiple providers (default InMemory, optional PostgreSQL), so search must adapt at runtime.

**Implementation Notes:**
- Detect provider via `DbContext.Database.ProviderName`.
- If provider contains `Npgsql`, use `EF.Functions.ILike(...)`.
- Otherwise, fall back to a cross-provider expression (e.g., normalized `ToUpper().Contains(...)`) that works for InMemory and translates for most relational providers.

### 4. Testing Strategy

#### Unit Tests with Modern Angular APIs
**Decision:** Used `provideHttpClient()` and `provideHttpClientTesting()` instead of deprecated modules.

**Rationale:**
- Align with Angular's new standalone API
- Future-proof codebase
- Better dependency injection

**Trade-offs:**
- ✅ Pros: Modern approach, no deprecation warnings
- ⚠️ Cons: Documentation still catching up with new APIs


#### Unit Tests for Backend using MSTest
**Decision:** Chose MSTest for backend unit tests.

**Rationale:**
- Integrated with .NET ecosystem
- Sufficient for API testing needs
- Familiarity

Trade-offs:
- ✅ Pros: Easy setup, good integration with CI/CD
- ⚠️ Cons: Less feature-rich than xUnit/NUnit, but adequate for current needs

---

## Feature Implementation Details

### Pagination
- Server-side pagination with configurable page size
- Visual page navigation with first/last/prev/next controls

### Filtering & Search
- Multi-criteria filtering (status, priority, search term)
- Order by Alphabetical Order and Due Date support
- Filter state preserved during pagination

### Task Management
- CRUD operations with validation
- Rich-text descriptions with HTML support
- Due dates with visual indicators
- Creation timestamps

### Error Handling
- Graceful degradation with user-friendly messages (This is mostly showcased with the Delete Task functionality, not really fully implemented for all features)
- Backend error messages surfaced to UI
- Specific error handling for 404/400/500 scenarios

---

## Known Limitations & Future Improvements

### Current Limitations

1. **Rich Text Editor**: Uses deprecated `execCommand` API
   - **Mitigation**: Still widely supported; consider migrating to Selection API in future

2. **Data Persistence**: In-memory storage by default
   - **Mitigation**: PostgreSQL support available via configuration

3. **Accessibility**: Color-only differentiation for status/priority
   - **Improvement**: Add icon patterns for color-blind users

4. **Mobile Optimization**: Responsive but could be enhanced
   - **Improvement**: Consider dedicated mobile views for smaller screens

### Potential Enhancements

- **Authentication**: Add user authentication and authorization
- **Real-time Updates**: WebSocket support for multi-user scenarios
- **Attachments**: File upload support for tasks
- **Comments**: Task commenting and collaboration features
- **Notifications**: Email/push notifications for due dates
- **Drag & Drop**: Reorder tasks or change status via drag & drop

---

## Performance Considerations

### Frontend Optimizations
- **Change Detection**: OnPush strategy for task list component
- **Lazy Loading**: Standalone components enable better code splitting
- **Minimal Dependencies**: Custom editor reduces bundle size

### Backend Optimizations
- **Pagination**: Prevents loading large datasets
- **Async Operations**: All I/O operations are asynchronous
- **Middleware Pipeline**: Centralized error handling reduces redundancy

---

## Conclusion

This solution balances modern development practices with practical trade-offs, prioritizing:
- **Developer Experience**: Clean code, minimal boilerplate
- **Maintainability**: Separation of concerns, testability
- **User Experience**: Intuitive UI, responsive design
- **Flexibility**: Easy to extend and configure

The architecture supports both rapid development and production deployment with minimal configuration changes.
