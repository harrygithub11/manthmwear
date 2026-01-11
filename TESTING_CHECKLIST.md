# 🧪 Testing Checklist - Phase 1 Features

## 🚀 Before You Start

### 1. Database Migration
```bash
npx prisma generate
npx prisma db push
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
```
http://localhost:3000/admin/mail-system
```

---

## ✅ Feature 1: Rich Text Editor & Attachments

### Test Rich Text Editor:
- [ ] Click "Compose" tab
- [ ] See rich text editor with toolbar
- [ ] Try bold, italic, underline text
- [ ] Try different colors
- [ ] Add a link
- [ ] Create a list (bullets or numbers)
- [ ] Click "Switch to Plain Text" toggle
- [ ] Back to rich text
- [ ] Formatting works correctly

### Test Attachments:
- [ ] Click attachment upload area
- [ ] Drag and drop a file (or click to browse)
- [ ] See file appear in attachments list
- [ ] Upload multiple files (try 3-4)
- [ ] Check file size shows correctly
- [ ] Remove an attachment (click X)
- [ ] Try uploading file over 25MB (should reject)
- [ ] Upload image file - see image icon

### Test Sending:
- [ ] Compose email with rich text
- [ ] Add attachments
- [ ] Click "Send Email"
- [ ] Should see "Email sent successfully" toast
- [ ] Check if attachments were included

---

## ✅ Feature 2: Email Drafts Auto-Save

### Test Auto-Save:
- [ ] Click "Compose"
- [ ] Start typing an email
- [ ] Wait 30 seconds
- [ ] See "Saving..." then "Saved" indicator
- [ ] Type more content
- [ ] Wait another 30 seconds
- [ ] See auto-save again

### Test Manual Save:
- [ ] Click "Save Draft" button
- [ ] See "Draft saved" toast
- [ ] See "Saved" indicator

### Test Drafts Tab:
- [ ] Click "Drafts" tab
- [ ] See your saved draft in list
- [ ] Draft shows: To, Subject, Last Updated
- [ ] Badge shows draft count (e.g., "1")

### Test Load Draft:
- [ ] Click on a draft in list
- [ ] Compose view opens with draft content
- [ ] All fields populated (To, Subject, Body)
- [ ] Can continue editing
- [ ] Auto-save continues to work

### Test Delete Draft:
- [ ] Hover over draft
- [ ] See trash icon appear
- [ ] Click trash icon
- [ ] Confirm deletion
- [ ] Draft removed from list

### Test Tab Close Protection:
- [ ] Start composing email
- [ ] Try to close browser tab
- [ ] Should see warning "Discard draft?"
- [ ] Cancel - stays on page
- [ ] Close tab - draft should be saved

### Test Send Deletes Draft:
- [ ] Load a draft
- [ ] Send the email
- [ ] Draft should be deleted automatically
- [ ] No longer in drafts list

---

## ✅ Feature 3: Email Signatures

### Test Signature Editor:
- [ ] Click "Signature" button in compose toolbar
- [ ] Signature modal opens
- [ ] Check "Auto-append signature..." checkbox
- [ ] Type signature in text area
- [ ] See preview update below
- [ ] Click "Switch to Rich Text"
- [ ] Format signature with rich text
- [ ] Preview shows formatted signature
- [ ] Click "Save Signature"
- [ ] See "Signature saved" toast
- [ ] Modal closes

### Test Signature Button:
- [ ] After saving, signature button shows green
- [ ] Shows checkmark (✓)
- [ ] Indicates signature is active

### Test Auto-Append:
- [ ] Compose new email
- [ ] Type message
- [ ] Click "Send Email"
- [ ] Signature should be appended automatically
- [ ] Should include "--" separator
- [ ] Signature appears after message

### Test Toggle Off:
- [ ] Open signature modal
- [ ] Uncheck "Auto-append..."
- [ ] Save
- [ ] Button no longer green
- [ ] Send email - no signature appended

### Test Per-Account:
- [ ] Switch to different email account
- [ ] Open signature modal
- [ ] Create different signature
- [ ] Save
- [ ] Switch accounts - each has own signature

---

## ✅ Feature 4: Advanced Search & Filters

### Test Search:
- [ ] Go to Inbox tab
- [ ] Type in search box
- [ ] Results filter instantly
- [ ] Search finds matches in:
  - From field
  - To field
  - Subject
  - Email body
- [ ] Clear search - all emails return

### Test Filters:
- [ ] Click "Filters" button
- [ ] Filter panel opens
- [ ] Enter sender email in "From" field
- [ ] Results filter to that sender
- [ ] Enter subject keyword
- [ ] Results filter further
- [ ] Select "Inbox Only" from folder dropdown
- [ ] Check "Has Attachments"
- [ ] Check "Unread Only"
- [ ] All filters work together

### Test Filter Count:
- [ ] Filters button shows count: "Filters (3)"
- [ ] Shows number of active filters
- [ ] Updates as you add/remove filters

### Test Clear Filters:
- [ ] Click red "Clear" button
- [ ] All filters reset
- [ ] All emails shown again
- [ ] Search cleared

### Test Result Counter:
- [ ] Shows "Showing X of Y emails"
- [ ] X = filtered count
- [ ] Y = total count
- [ ] Updates as you filter

### Test Empty State:
- [ ] Apply filters that match nothing
- [ ] See "No matching emails" message
- [ ] See suggestion to adjust filters
- [ ] Clear filters - emails return

---

## ✅ Feature 5: Bulk Operations & Read Status

### Test Bulk Mode:
- [ ] Click "Select" button
- [ ] Checkboxes appear on all emails
- [ ] Button changes to "Exit Bulk"
- [ ] Click email checkbox - gets selected
- [ ] Click again - deselects
- [ ] Selection count shows: "3 selected"

### Test Select All/None:
- [ ] In bulk mode, click "Select All"
- [ ] All visible emails selected
- [ ] Count updates correctly
- [ ] Click "Select None"
- [ ] All deselected

### Test Bulk Mark as Read:
- [ ] Select 3-4 unread emails (blue dot)
- [ ] Click green "Mark Read" button
- [ ] Blue dots disappear
- [ ] Toast: "Marked 3 email(s) as read"
- [ ] Selection cleared
- [ ] Emails now marked as read

### Test Bulk Mark as Unread:
- [ ] Select 3-4 read emails
- [ ] Click blue "Mark Unread" button
- [ ] Blue dots appear
- [ ] Toast: "Marked 3 email(s) as unread"
- [ ] Selection cleared
- [ ] Emails now unread

### Test Bulk Delete:
- [ ] Select 2-3 emails
- [ ] Click red "Delete" button
- [ ] Confirmation prompt appears
- [ ] Confirm deletion
- [ ] Emails removed from list
- [ ] Toast: "Deleted 3 email(s)"

### Test Exit Bulk:
- [ ] Click "Exit Bulk" button
- [ ] Checkboxes disappear
- [ ] Selections cleared
- [ ] Normal view restored

---

## 🌟 DATABASE READ STATUS (KEY FEATURE!)

### Test Read Status Persistence:
- [ ] Mark 3 emails as read
- [ ] Refresh page (F5)
- [ ] Emails still marked as read ✅
- [ ] Blue dots don't come back

### Test Cross-Device Sync:
- [ ] On Device A: Mark email as read
- [ ] On Device B (or different browser):
  - Open same mail system
  - Login to same account
  - Go to inbox
  - Email shows as read ✅
- [ ] Works across devices!

### Test After Logout:
- [ ] Mark emails as read
- [ ] Logout
- [ ] Login again
- [ ] Emails still marked as read ✅
- [ ] Persists across sessions

### Test Per-Account:
- [ ] Mark emails as read in Account A
- [ ] Switch to Account B
- [ ] Different read statuses
- [ ] Switch back to Account A
- [ ] Read status restored correctly

### Test Different Folders:
- [ ] Mark INBOX email as read
- [ ] Mark Sent email as read
- [ ] Both tracked separately
- [ ] Folder-aware tracking works

---

## 🎨 UI/UX Testing

### Test Visual Feedback:
- [ ] Buttons have hover effects
- [ ] Active filters highlighted
- [ ] Loading spinners show
- [ ] Toast notifications appear
- [ ] Animations smooth
- [ ] Icons render correctly

### Test Responsiveness:
- [ ] Resize browser window
- [ ] UI adapts to smaller sizes
- [ ] Mobile view works
- [ ] Touch interactions work

### Test Performance:
- [ ] Search is instant
- [ ] Filters apply immediately
- [ ] No lag when selecting multiple
- [ ] Smooth scrolling
- [ ] Fast email loading

---

## 🐛 Error Testing

### Test Error Scenarios:
- [ ] Send email without subject - shows error
- [ ] Upload file over 25MB - rejected
- [ ] Try 11th file - rejected
- [ ] Network error - shows toast
- [ ] Invalid email address - validation
- [ ] Delete with nothing selected - no error

---

## 📊 Overall System Test

### Complete User Flow:
1. [ ] Login to mail system
2. [ ] See inbox with emails
3. [ ] Search for specific email
4. [ ] Apply filters
5. [ ] Click email to read it
6. [ ] Email marked as read (blue dot gone)
7. [ ] Click "Compose"
8. [ ] Write email with rich text
9. [ ] Upload attachment
10. [ ] Add signature
11. [ ] Auto-save happens (wait 30s)
12. [ ] Close tab - draft saved
13. [ ] Return to mail system
14. [ ] Load draft from drafts tab
15. [ ] Send email
16. [ ] Draft deleted automatically
17. [ ] Email appears in Sent folder
18. [ ] Use bulk operations
19. [ ] Select multiple emails
20. [ ] Mark as read in bulk
21. [ ] Refresh page
22. [ ] Read status persists ✅
23. [ ] Open on different device
24. [ ] Read status synced ✅

---

## ✅ Success Criteria

All features should:
- ✅ Work without errors
- ✅ Provide visual feedback
- ✅ Persist data correctly
- ✅ Sync across devices (read status)
- ✅ Handle errors gracefully
- ✅ Be intuitive to use
- ✅ Perform quickly

---

## 🎉 When All Tests Pass

**Congratulations! Your advanced mail system is ready for production!** 🚀

You now have:
- ✅ Professional email composition
- ✅ Auto-saving drafts
- ✅ Customizable signatures
- ✅ Powerful search & filters
- ✅ Efficient bulk operations
- ✅ **Cross-device read tracking**

---

## 📝 Found Issues?

If you find bugs:
1. Note which test failed
2. Check browser console for errors
3. Check database connection
4. Verify API endpoints working
5. Review documentation for that feature

---

## 🚀 Next Steps After Testing

1. **Production Deployment**
   - Set up production database
   - Configure environment variables
   - Deploy to hosting platform

2. **User Training**
   - Create user guide
   - Record demo videos
   - Train support team

3. **Monitoring**
   - Set up error tracking
   - Monitor performance
   - Collect user feedback

4. **Phase 2?**
   - Email threading
   - Labels & tags
   - Email templates
   - Analytics dashboard

---

**Happy Testing! 🎉**
