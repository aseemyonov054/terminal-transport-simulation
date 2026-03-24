import math
import random
from .service_path_creation import get_angle

class ProcessDescription():
    def __init__(self, draw_road, road_path, queue_points, travel_time, list_of_roads):
        self.draw_road = draw_road
        self.road_path = road_path
        self.queue_points = queue_points
        self.travel_time = travel_time
        self.list_of_roads = list_of_roads
        self.list_of_events = {}
        self.total_time = {}
        self.queue_length = []

    def print_object(self):
        new_dict = {
            "list_of_events" : self.list_of_events,
            "list_of_roads" : self.list_of_roads,
            "road_path" : self.road_path,
            "travel_time" : self.travel_time,
            "queue_points" : self.queue_points,
            "draw_road" : str(self.draw_road),
        }
        return new_dict


def reform_path(path):
    road_path = []
    queue_points = []
    for p in path:
        road_path.append([p['action'], [p['x'], p['y']]])
        if p['action'] == "serve":
            queue_points.append([[p['x'], p['y']], 2, 3])
    return road_path, queue_points

def calculate_travel_time(road_path):
    # basic vector
    vector_z = [[0,0],[1000,0]]
    list_of_roads = []
    travel_time = []
    speed = 333
    # calculate road rotation
    #road_path[0].append(90)
    for i in range(1, len(road_path), 1):
        point1 = road_path[i-1][1]
        point2 = road_path[i][1]
        # angle of road rotation
        angle = get_angle(vector_z, [point1, point2])
        road_path[i-1].append(angle)
        road_center = [int((point2[0] + point1[0]) / 2), int((point2[1] + point1[1]) / 2), ]
        # lenght of road
        dist = math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2)
        # list of roads to draw
        list_of_roads.append([dist, road_center, angle])
        # travel time for animation
        travel_time.append(dist / speed)
    road_path[-1].append(0)
    return travel_time, list_of_roads, road_path