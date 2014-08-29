__author__ = 'martin+tom'
from lib.traj.C3 import traj_planet_asteroid

start_planet='earth'
target_asteroid='Eros'
t_launch=1900
t_arrive=2450
rev=0
N=100

#traj_t, traj_x, traj_y, traj_z = traj_planet_asteroid(start_planet,target_asteroid,t_launch,t_arrive,rev,N)
#print traj_t[0], traj_x[0]

def gen_traj(start_planet, target_obj, t_launch, t_arrive, rev, N):
    traj_t, traj_x, traj_y, traj_z = traj_planet_asteroid(start_planet,target_obj,t_launch,t_arrive,rev,N)