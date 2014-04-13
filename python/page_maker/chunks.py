# this file defines static values to be used in templates

class chunks(object):
    def __init__(self):

        self.dependencies = []  # as in... javascript dependencies to be included in the header... (not implemented)
        self.appName = "Cosmosium"
        self.appVers = "v0.1.alpha"
        
        self.messages_title = "game progress messages"
        self.all_messages_text = "see all"
        self.all_messages_link = '#'
        
        self.notes_title = "urgent event notifications"
        self.all_notes_text = "see all"
        self.all_notes_link = "#"

        self.tasks_title = "progress"
        self.all_tasks_text = "see all"
        self.all_tasks_link = "#"

        self.profile_link_text = "Profile"
        self.signout_link_text = "Sign out"
        self.signout_link = '#'
        self.salutation = 'Hello'
        
        self.button1_text = 'Dashboard'
        self.button2_text = 'Solar System'
        self.button2_num  = 1