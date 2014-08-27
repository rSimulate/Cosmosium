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

low_arrive=2185.0
high_arrive=3500.0

low_launch=1950.0
high_launch=2162.0

reso=100


xy = np.zeros((reso,reso))


rev=0

for i in range(0,reso,1):

    for j in range(0,reso,1):

        tlaunch = ((high_launch-low_launch)/reso)*i + low_launch
        tarrive = ((high_arrive-low_arrive)/reso)*j + low_arrive

        if tarrive <= tlaunch:

            xy[i,j]=0

        else:

            start_planet='earth'
            arrive_planet='mars'


            N=20

            traj=planet_asteroid(start_planet,tlaunch,tarrive,rev,N)



            xy[i,j]=traj







#fig = plt.figure()
#ax = fig.gca(projection='3d')

#X = np.arange(low_arrive, high_arrive,((high_arrive-low_arrive)/reso))
#Y = np.arange(low_launch, high_launch,((high_launch-low_launch)/reso))
#X, Y = np.meshgrid(X, Y)


#ax.plot_surface(X,Y,xy)
#cset = ax.contour(X, Y, xy, zdir='z', offset=-100, cmap=cm.coolwarm)

#plt.show()

# fig = plt.figure()
# ax = fig.gca(projection='3d')
Y = np.arange(low_arrive, high_arrive,((high_arrive-low_arrive)/reso))
X = np.arange(low_launch, high_launch,((high_launch-low_launch)/reso))
X, Y = np.meshgrid(X, Y)


norm=np.max(xy)

Z = xy/norm
# surf = ax.plot_surface(X, Y, Z, rstride=1, cstride=1, cmap=cm.coolwarm,
#         linewidth=0, antialiased=False)#,vmax=5E8)
# #ax.set_zlim(0, 100)
#
# ax.zaxis.set_major_locator(LinearLocator(10))
# ax.zaxis.set_major_formatter(FormatStrFormatter('%.02f'))
#
# fig.colorbar(surf, shrink=0.5, aspect=5)
#
#
#
# plt.show()

# plt.figure()
# CS = plt.contour(X, Y, Z)
# plt.clabel(CS, inline=1, fontsize=10)
# title='Earth -> Aphosis, ' + str(rev) + ' orbits'
# plt.title(title)
#
# plt.show()

levels = MaxNLocator(nbins=15).tick_values(Z.min(), Z.max())
cmap = plt.get_cmap('PiYG')
norm = BoundaryNorm(levels, ncolors=cmap.N, clip=True)
im = plt.pcolormesh(X, Y, Z, cmap=cmap,vmax=.03)
plt.colorbar()
# set the limits of the plot to the limits of the data

title='Earth -> Aphosis, ' + str(rev) + ' orbits'
plt.title(title)



plt.show()
