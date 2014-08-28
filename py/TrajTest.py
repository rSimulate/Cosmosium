__author__ = 'martin'

'''
	USAGE: traj = getTraj_simple(start_planet, arrive_planet, tlaunch, tarrive,N)


'''


from lib.PyKEP.C3 import planet_asteroid,planet_planet
from PyKEP import epoch, DAY2SEC, planet_ss, AU, MU_SUN, lambert_problem, planet
import AsteroidDB
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import cm
from matplotlib.ticker import LinearLocator, FormatStrFormatter

import matplotlib
import numpy as np
import matplotlib.cm as cm
import matplotlib.mlab as mlab
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator
from matplotlib.colors import BoundaryNorm

low_arrive=2250.0
high_arrive=2500.0

low_launch=1900.0
high_launch=2200.0

reso=100


xy = np.zeros((reso,reso))


rev=0

for i in range(0,reso,1):

    for j in range(0,reso,1):

        tlaunch = ((high_launch-low_launch)/reso)*i + low_launch
        tarrive = ((high_arrive-low_arrive)/reso)*j + low_arrive

        if tarrive <= tlaunch:

            xy[i,j]=None

        else:

            start_planet='earth'
            arrive_planet='mars'
            target_name="Eros"


            N=20

            traj=planet_asteroid(start_planet,target_name,tlaunch,tarrive,rev,N)



            xy[i,j]=traj


Y = np.arange(low_arrive, high_arrive,((high_arrive-low_arrive)/reso))
X = np.arange(low_launch, high_launch,((high_launch-low_launch)/reso))
Y, X = np.meshgrid(Y, X)


norm=np.max(xy)

Z = xy/norm

levels = MaxNLocator(nbins=15).tick_values(Z.min(), Z.max())
cmap = plt.get_cmap('PiYG')
norm = BoundaryNorm(levels, ncolors=cmap.N, clip=True)
im = plt.pcolormesh(X, Y, Z, cmap=cmap,vmax= .05)
plt.colorbar()
# set the limits of the plot to the limits of the data

title='Earth ->'+str(target_name) +" "+ str(rev) + ' orbits'
plt.title(title)



plt.show()
