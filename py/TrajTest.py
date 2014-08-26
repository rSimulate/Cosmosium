__author__ = 'martin'

'''
	USAGE: traj = getTraj_simple(start_planet, arrive_planet, tlaunch, tarrive,N)


'''


from lib.PyKEP.getTraj_simple import getTraj_simple
from PyKEP import epoch, DAY2SEC, planet_ss, AU, MU_SUN, lambert_problem, planet
import AsteroidDB
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import cm
from matplotlib.ticker import LinearLocator, FormatStrFormatter


low_arrive=2250.0
high_arrive=4000.0

low_launch=2000.0
high_launch=2200.0

reso=50


xy = np.zeros((reso,reso))




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

            traj=getTraj_simple(start_planet,arrive_planet,tlaunch,tarrive,N)


            xy[i,j]=traj


#fig = plt.figure()
#ax = fig.gca(projection='3d')

#X = np.arange(low_arrive, high_arrive,((high_arrive-low_arrive)/reso))
#Y = np.arange(low_launch, high_launch,((high_launch-low_launch)/reso))
#X, Y = np.meshgrid(X, Y)


#ax.plot_surface(X,Y,xy)
#cset = ax.contour(X, Y, xy, zdir='z', offset=-100, cmap=cm.coolwarm)

#plt.show()

fig = plt.figure()
ax = fig.gca(projection='3d')
X = np.arange(low_arrive, high_arrive,((high_arrive-low_arrive)/reso))
Y = np.arange(low_launch, high_launch,((high_launch-low_launch)/reso))
X, Y = np.meshgrid(X, Y)

Z = xy
surf = ax.plot_surface(X, Y, Z, rstride=1, cstride=1, cmap=cm.coolwarm,
        linewidth=0, antialiased=False)
#ax.set_zlim(0, 5000)

ax.zaxis.set_major_locator(LinearLocator(10))
ax.zaxis.set_major_formatter(FormatStrFormatter('%.02f'))

fig.colorbar(surf, shrink=0.5, aspect=5)

plt.show()