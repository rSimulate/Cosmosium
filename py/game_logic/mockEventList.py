
class pastEvent(object):
    def __init__(self,time,title,text='',img='#'):
        self.time = time
        self.title= title
        self.text = text
        self.img  = img

def getMockEventList():
    return [ 
    pastEvent('Nov 21 1988','Carl_Sagan- has advanced - to the age of observation!'),
    pastEvent('Oct 14 2004','Jebediah_Kerman has advanced - to the age of observation!'),
    pastEvent('Feb 23 2005','Johannes_Kepler- has advanced - to the age of observation!'),
    pastEvent('Oct 22 2014','Cosmosium Asteroid Ventures named game of the year!','heh...right'),
    pastEvent('Sept 26 2017','Historical:- NASA ARM mission launches!','Once launched from its Atlas V rocket, the spacecraft used for the mission slowly spirals out of Earth orbit for about two years. Using a gravitational slingshot, it would then spend another two years going to the target asteroid, arriving there in 2019.'),
    pastEvent('July 14 2021','Historical:- First manned mission to asteroid lands on asteroid in lunar orbit','If the Asteroid Retrieval and Utilization mission and the Space Launch System are both completed on schedule, a manned mission to the asteroid brought to lunar orbit could be launched as early as 2021.'),
    pastEvent('Apr 28 2055','Carl_Sagan- has advanced - to the age of interplanetary habitation!'),
    pastEvent('Jun 07 2087','Jebediah_Kerman- has suffered a tragic loss - due to lax mining safety procedures.'),
    pastEvent('May 01 2100','Danger!- Rogue asteroid detected!','A rogue asteroid has been detected on a collision course with earth to arrive Dec 17 2103! The game is coming to an end! Be the first to save the world to win!')
    ]