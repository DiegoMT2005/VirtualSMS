# Testing Guide

Comprehensive testing guide for the Voice AI & SMS Booking Management Platform.

## Testing Strategy

### 1. Manual Testing
- Feature testing
- UI/UX testing
- Cross-browser testing
- Mobile responsiveness

### 2. Automated Testing (Future)
- Unit tests
- Integration tests
- End-to-end tests

## Pre-Deployment Testing Checklist

### Authentication & Authorization

- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Logout functionality works
- [ ] Protected routes redirect to login
- [ ] Session persists on page refresh
- [ ] Session expires appropriately

### Dashboard

- [ ] Dashboard loads without errors
- [ ] All metrics display correctly
- [ ] Charts render properly
- [ ] Recent calls table shows data
- [ ] Upcoming bookings display
- [ ] Loading states work
- [ ] Error states handled gracefully

### Call Logs

- [ ] Call logs page loads
- [ ] Filters work correctly:
  - [ ] Phone number filter
  - [ ] Status filter
  - [ ] Sentiment filter
  - [ ] Call type filter
  - [ ] Date range filter
- [ ] Pagination works
- [ ] Search functionality
- [ ] Call details modal opens
- [ ] Transcript displays
- [ ] Recording playback (if available)
- [ ] Export functionality

### Calls Management

- [ ] Calls list displays
- [ ] Create new call
- [ ] Edit call details
- [ ] Delete call
- [ ] View call transcript
- [ ] Sentiment analysis displays
- [ ] Status updates work

### SMS Conversations

- [ ] Conversations list loads
- [ ] Search by phone number
- [ ] Conversation status badges
- [ ] Message count displays
- [ ] Timestamp formatting
- [ ] View transcript button
- [ ] Pagination works
- [ ] Empty state displays

### Appointments

- [ ] Appointments list loads
- [ ] Filters work:
  - [ ] Customer name
  - [ ] Phone number
  - [ ] Status
  - [ ] Source
  - [ ] Date range
- [ ] Create appointment
- [ ] Edit appointment
- [ ] Delete appointment
- [ ] Status updates
- [ ] Pagination
- [ ] Calendar view (if implemented)

### Bookings

- [ ] Bookings list displays
- [ ] Create booking
- [ ] Edit booking
- [ ] Delete booking
- [ ] Status changes
- [ ] Customer information
- [ ] Service type selection
- [ ] Date/time picker
- [ ] Notes field

### Customers

- [ ] Customer list loads
- [ ] Search functionality
- [ ] Filters work
- [ ] Create customer
- [ ] Edit customer
- [ ] Delete customer
- [ ] View customer details
- [ ] Customer history
- [ ] Tags management
- [ ] Notes editing
- [ ] Pagination

### Analytics

- [ ] Analytics page loads
- [ ] Date range selector works
- [ ] Charts render:
  - [ ] Call volume chart
  - [ ] Booking trends
  - [ ] Revenue chart
  - [ ] Conversion rate
- [ ] Metrics calculate correctly
- [ ] Export data functionality
- [ ] Loading states
- [ ] Error handling

### Voice Agent Configuration

- [ ] Configuration page loads
- [ ] VAPI settings display
- [ ] Edit assistant settings
- [ ] Phone number management
- [ ] Voice selection
- [ ] Test connection button
- [ ] Save changes
- [ ] Validation works

### API Settings

- [ ] Settings page loads
- [ ] VAPI API key field
- [ ] Twilio credentials fields
- [ ] Test connection buttons
- [ ] Save functionality
- [ ] Validation errors
- [ ] Success messages
- [ ] Secure input fields (password type)

### FAQ Management

- [ ] FAQ list loads
- [ ] Grouped by category
- [ ] Create new FAQ
- [ ] Edit FAQ
- [ ] Delete FAQ
- [ ] Keywords display
- [ ] Usage count shows
- [ ] Active/inactive toggle
- [ ] Search/filter

### System Prompts

- [ ] Prompts page loads
- [ ] Voice prompt tab
- [ ] SMS prompt tab
- [ ] Text editor works
- [ ] Character count
- [ ] Save changes
- [ ] Version display
- [ ] Warning alert shows
- [ ] Guidelines section

### Settings

- [ ] Settings page loads
- [ ] Profile information
- [ ] Update settings
- [ ] Save changes
- [ ] Validation

## UI/UX Testing

### Responsiveness

Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape

### Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Accessibility

- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Color contrast sufficient
- [ ] Screen reader compatible
- [ ] Alt text on images

### Performance

- [ ] Page load time < 3 seconds
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] No console errors
- [ ] No memory leaks
- [ ] Images optimized
- [ ] Lazy loading works

## Data Testing

### CRUD Operations

For each entity (Calls, Bookings, Customers, etc.):

#### Create
- [ ] Form validation works
- [ ] Required fields enforced
- [ ] Success message displays
- [ ] Data appears in list
- [ ] Database updated

#### Read
- [ ] List displays correctly
- [ ] Details view shows all data
- [ ] Pagination works
- [ ] Sorting works
- [ ] Filtering works

#### Update
- [ ] Form pre-fills with data
- [ ] Changes save correctly
- [ ] Validation works
- [ ] Success message
- [ ] List updates

#### Delete
- [ ] Confirmation dialog shows
- [ ] Delete removes data
- [ ] Success message
- [ ] List updates
- [ ] Database updated

### Edge Cases

- [ ] Empty states display
- [ ] Large datasets (100+ items)
- [ ] Special characters in input
- [ ] Very long text inputs
- [ ] Null/undefined values
- [ ] Concurrent updates
- [ ] Network errors
- [ ] Slow connections

## Integration Testing

### Supabase

- [ ] Database connection works
- [ ] Queries execute correctly
- [ ] Real-time updates (if used)
- [ ] Authentication flow
- [ ] RLS policies work
- [ ] Error handling

### VAPI Integration

- [ ] API key validation
- [ ] Test connection works
- [ ] Voice agent configuration
- [ ] Error messages clear

### Twilio Integration

- [ ] Credentials validation
- [ ] Test connection works
- [ ] SMS sending (if implemented)
- [ ] Error handling

## Error Handling

### Network Errors

- [ ] Offline detection
- [ ] Retry logic
- [ ] Error messages
- [ ] Graceful degradation

### API Errors

- [ ] 400 errors handled
- [ ] 401 redirects to login
- [ ] 403 shows permission error
- [ ] 404 shows not found
- [ ] 500 shows server error
- [ ] Timeout handling

### Form Errors

- [ ] Validation messages clear
- [ ] Field-level errors
- [ ] Form-level errors
- [ ] Error styling
- [ ] Focus on error field

## Security Testing

- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure headers
- [ ] HTTPS only
- [ ] Environment variables secure
- [ ] No sensitive data in console
- [ ] No sensitive data in URLs

## Performance Testing

### Load Testing

- [ ] 10 concurrent users
- [ ] 50 concurrent users
- [ ] 100 concurrent users
- [ ] Response times acceptable
- [ ] No crashes

### Stress Testing

- [ ] Large data sets (1000+ records)
- [ ] Multiple filters applied
- [ ] Complex queries
- [ ] Memory usage stable

## Test Data

### Sample Data Sets

Create test data for:
- [ ] 10 calls
- [ ] 20 bookings
- [ ] 15 customers
- [ ] 30 SMS messages
- [ ] 5 FAQs
- [ ] 2 system prompts

### Test Scenarios

1. **New User Flow**
   - Login
   - View empty dashboard
   - Create first booking
   - View analytics

2. **Power User Flow**
   - Login
   - View dashboard with data
   - Filter call logs
   - Create appointment
   - Update customer
   - Check analytics

3. **Admin Flow**
   - Login
   - Configure voice agent
   - Update API settings
   - Manage FAQs
   - Edit system prompts

## Bug Reporting

When reporting bugs, include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Exact steps to recreate
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: Visual evidence
6. **Environment**: Browser, OS, screen size
7. **Console Errors**: Any error messages
8. **Severity**: Critical, High, Medium, Low

### Bug Template

```markdown
## Bug Description
[Clear description]

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots
[Attach screenshots]

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Screen: 1920x1080

## Console Errors
```
[Error messages]
```

## Severity
[Critical/High/Medium/Low]
```

## Testing Tools

### Recommended Tools

- **Browser DevTools**: Built-in debugging
- **React DevTools**: Component inspection
- **Lighthouse**: Performance auditing
- **WAVE**: Accessibility testing
- **Postman**: API testing
- **BrowserStack**: Cross-browser testing

### Future Automated Testing

Consider adding:
- **Jest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **Cypress**: E2E testing

## Continuous Testing

### Before Each Commit

- [ ] Run linter: `npm run lint`
- [ ] Check types: `npm run type-check`
- [ ] Test locally: `npm run dev`
- [ ] Review changes

### Before Each Deployment

- [ ] Run full test suite
- [ ] Test on staging environment
- [ ] Review all checklist items
- [ ] Get approval from stakeholders

### After Deployment

- [ ] Smoke test production
- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Verify all features work

## Test Coverage Goals

- [ ] All pages load without errors
- [ ] All CRUD operations work
- [ ] All forms validate correctly
- [ ] All integrations functional
- [ ] All error states handled
- [ ] All loading states work
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Accessible
- [ ] Performant

## Support

For testing questions:
- Review this guide
- Check component documentation
- Test in isolation
- Report issues on GitHub
