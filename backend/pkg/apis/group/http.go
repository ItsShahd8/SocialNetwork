package group

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	u "socialnetwork/pkg/apis/user"
	database "socialnetwork/pkg/db"
	"strconv"
)

// CreateGroup handles group creation
func CreateGroup(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Validate session and get user ID
	userID, loggedIn := u.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
		return
	}

	// Parse request body
	var groupData CreateGroupRequest
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&groupData); err != nil {
		fmt.Println("JSON Decoding Error:", err)
		http.Error(w, "Failed to parse JSON", http.StatusBadRequest)
		return
	}

	// Validate group fields
	if groupData.Title == "" || groupData.Description == "" {
		http.Error(w, "Title and Description cannot be empty.", http.StatusBadRequest)
		return
	}

	// Insert the group into the database
	groupID, createdAt, err := database.InsertGroup(db, userID, groupData.Title, groupData.Description)
	if err != nil {
		fmt.Println("Error inserting group:", err)
		http.Error(w, "Failed to create group", http.StatusInternalServerError)
		return
	}

	// Automatically add creator as admin member
	err = database.InsertGroupMember(db, int(groupID), userID, "accepted", true)
	if err != nil {
		fmt.Println("Error adding creator as group admin:", err)
		http.Error(w, "Failed to add creator to group", http.StatusInternalServerError)
		return
	}

	// Send success response
	response := map[string]interface{}{
		"success":   true,
		"message":   "Group created successfully.",
		"groupID":   groupID,
		"createdAt": createdAt,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// GetGroups returns all groups
func GetGroups(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Validate session and get user ID
	userID, loggedIn := u.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
		return
	}

	groups, err := database.GetAllGroupsWithMembership(db, userID)
	if err != nil {
		fmt.Println("Error retrieving groups:", err)
		http.Error(w, "Failed to retrieve groups", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groups)
}

// GetGroupDetails returns detailed information about a specific group
func GetGroupDetails(db *sql.DB, w http.ResponseWriter, r *http.Request, groupIDStr string) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Validate session
	userID, loggedIn := u.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
		return
	}

	groupID, err := database.ParseID(groupIDStr)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	group, err := database.GetGroupByID(db, groupID)
	if err != nil {
		fmt.Println("Error retrieving group:", err)
		http.Error(w, "Group not found", http.StatusNotFound)
		return
	}

	// Check if user is a member
	isMember, err := database.IsGroupMember(db, groupID, userID)
	if err != nil {
		fmt.Println("Error checking group membership:", err)
		http.Error(w, "Error checking membership", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"group":    group,
		"isMember": isMember,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// CreateGroupPost allows members to create a post inside a group
func CreateGroupPost(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, loggedIn := u.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
		return
	}

	var body struct {
		GroupID    int      `json:"group_id"`
		Title      string   `json:"title"`
		Content    string   `json:"content"`
		Categories []string `json:"categories"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Failed to parse JSON", http.StatusBadRequest)
		return
	}
	if body.Title == "" || body.Content == "" || body.GroupID == 0 {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// ensure user is a member
	isMember, err := database.IsGroupMember(db, body.GroupID, userID)
	if err != nil || !isMember {
		http.Error(w, "You are not a member of this group", http.StatusForbidden)
		return
	}

	// create post with privacy public, but scoped to group via group_id
	postID, createdAt, err := database.InsertPostWithGroup(db, userID, body.Title, body.Content, "", body.GroupID)
	if err != nil {
		fmt.Println("Error inserting group post:", err)
		http.Error(w, "Failed to create post", http.StatusInternalServerError)
		return
	}

	// attach categories
	for _, catName := range body.Categories {
		if catName == "" {
			continue
		}
		catID, err := database.GetCategoryID(db, catName)
		if err != nil {
			fmt.Println("GetCategoryID error:", err)
			continue
		}
		_ = database.InsertPostCategory(db, int(postID), catID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"postID":    postID,
		"createdAt": createdAt,
	})
}

// GetGroupPosts returns posts only for members of the group
func GetGroupPosts(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, loggedIn := u.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
		return
	}

	groupIDStr := r.URL.Query().Get("group_id")
	groupID, err := strconv.Atoi(groupIDStr)
	if err != nil || groupID == 0 {
		http.Error(w, "Invalid group id", http.StatusBadRequest)
		return
	}
	isMember, err := database.IsGroupMember(db, groupID, userID)
	if err != nil || !isMember {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	posts, err := database.GetPostsByGroupIDForMember(db, groupID)
	if err != nil {
		fmt.Println("GetPostsByGroupIDForMember error:", err)
		http.Error(w, "Failed to get posts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

// CreateGroupComment allows members to comment on group posts
func CreateGroupComment(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID, loggedIn := u.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
		return
	}
	var body struct {
		PostID  int    `json:"post_id"`
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Failed to parse JSON", http.StatusBadRequest)
		return
	}
	if body.PostID == 0 || body.Content == "" {
		http.Error(w, "Missing fields", http.StatusBadRequest)
		return
	}
	// ensure post belongs to group and user is member of that group
	groupID, err := database.GetGroupIDByPostID(db, body.PostID)
	if err != nil || groupID == 0 {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}
	isMember, err := database.IsGroupMember(db, groupID, userID)
	if err != nil || !isMember {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	_, _, err = database.InsertComment(db, body.PostID, userID, body.Content, "")
	if err != nil {
		http.Error(w, "Failed to create comment", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

// InviteUserToGroup handles group invitations
func InviteUserToGroup(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Validate session and get user ID
	inviterID, loggedIn := u.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
		return
	}

	// Parse request body
	var inviteData InviteUserRequest
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&inviteData); err != nil {
		fmt.Println("JSON Decoding Error:", err)
		http.Error(w, "Failed to parse JSON", http.StatusBadRequest)
		return
	}

	// Check if inviter is a member of the group
	isMember, err := database.IsGroupMember(db, inviteData.GroupID, inviterID)
	if err != nil || !isMember {
		http.Error(w, "You must be a member to invite users", http.StatusForbidden)
		return
	}

	// Check if user is already a member or has pending invitation
	existingStatus, err := database.GetGroupMemberStatus(db, inviteData.GroupID, inviteData.UserID)
	if err == nil && existingStatus != "" {
		http.Error(w, "User is already a member or has a pending invitation", http.StatusConflict)
		return
	}

	// Insert invitation
	err = database.InsertGroupInvitation(db, inviteData.GroupID, inviterID, inviteData.UserID)
	if err != nil {
		fmt.Println("Error creating invitation:", err)
		http.Error(w, "Failed to send invitation", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Invitation sent successfully.",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// RespondToGroupInvitation handles accepting/declining group invitations
func RespondToGroupInvitation(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Validate session and get user ID
	userID, loggedIn := u.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
		return
	}

	// Parse request body
	var responseData ResponseInvitationRequest
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&responseData); err != nil {
		fmt.Println("JSON Decoding Error:", err)
		http.Error(w, "Failed to parse JSON", http.StatusBadRequest)
		return
	}

	if responseData.Status != "accepted" && responseData.Status != "declined" {
		http.Error(w, "Invalid status. Must be 'accepted' or 'declined'", http.StatusBadRequest)
		return
	}

	// Update invitation status
	err := database.UpdateGroupInvitationStatus(db, responseData.InvitationID, userID, responseData.Status)
	if err != nil {
		fmt.Println("Error updating invitation:", err)
		http.Error(w, "Failed to respond to invitation", http.StatusInternalServerError)
		return
	}

	// If accepted, add user to group members
	if responseData.Status == "accepted" {
		groupID, err := database.GetGroupIDFromInvitation(db, responseData.InvitationID)
		if err != nil {
			fmt.Println("Error getting group ID:", err)
			http.Error(w, "Failed to process invitation", http.StatusInternalServerError)
			return
		}

		err = database.InsertGroupMember(db, groupID, userID, "accepted", false)
		if err != nil {
			fmt.Println("Error adding user to group:", err)
			http.Error(w, "Failed to join group", http.StatusInternalServerError)
			return
		}
	}

	response := map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Invitation %s successfully.", responseData.Status),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// RequestToJoinGroup handles join requests
func RequestToJoinGroup(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Validate session and get user ID
	userID, loggedIn := u.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
		return
	}

	// Parse request body
	var joinData JoinGroupRequest
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&joinData); err != nil {
		fmt.Println("JSON Decoding Error:", err)
		http.Error(w, "Failed to parse JSON", http.StatusBadRequest)
		return
	}

	// Check if user is already a member or has pending request
	existingStatus, err := database.GetGroupMemberStatus(db, joinData.GroupID, userID)
	if err == nil && existingStatus != "" {
		if existingStatus == "accepted" {
			http.Error(w, "You are already a member of this group", http.StatusConflict)
		} else {
			http.Error(w, "You already have a pending request for this group", http.StatusConflict)
		}
		return
	}

	// Add user as pending member (requires approval)
	err = database.InsertGroupMember(db, joinData.GroupID, userID, "pending", false)
	if err != nil {
		fmt.Println("Error creating join request:", err)
		http.Error(w, "Failed to send join request", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Join request sent successfully. Waiting for group admin approval.",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetUserGroups returns groups where user is a member
func GetUserGroups(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Validate session and get user ID
	userID, loggedIn := u.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
		return
	}

	groups, err := database.GetUserGroups(db, userID)
	if err != nil {
		fmt.Println("Error retrieving user groups:", err)
		http.Error(w, "Failed to retrieve groups", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groups)
}

// GetGroupInvitations returns pending invitations for the user
func GetGroupInvitations(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Validate session and get user ID
	userID, loggedIn := u.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
		return
	}

	invitations, err := database.GetUserGroupInvitations(db, userID)
	if err != nil {
		fmt.Println("Error retrieving invitations:", err)
		http.Error(w, "Failed to retrieve invitations", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(invitations)
}
