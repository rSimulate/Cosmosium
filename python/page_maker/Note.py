# icon choices (class_text): (i don't know how these work...)
#   "ion ion-ios7-people info"  = 3 blue ppl
#   "fa fa-warning danger"       = red !
#   "ion ion-ios7-cart success" = green cart
#   "ion ion-ios7-person danger" =  3 yellow ppl
#   "fa fa-users warning"       = 1 red dude

class Note(object):
    def __init__(self):
        self.class_text = "fa fa-warning danger" #temporarily not implemented
        self.text = 'Asteroid incoming! '
        self.link = '#'