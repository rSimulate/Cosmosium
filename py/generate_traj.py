__author__ = 'martin'
from lib.PyKEP.C3 import traj_planet_asteroid

start_planet='earth'
target_asteroid='Eros'
t_launch=1900
t_arrive=2450
rev=0
N=5

print  traj_planet_asteroid(start_planet,target_asteroid,t_launch,t_arrive,rev,N)