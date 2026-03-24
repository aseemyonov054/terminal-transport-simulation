import math
import numpy as np

def get_slope(vector):
    '''
        Calculates the slope (relative angle) of a line
    '''
    rise = vector[1][1] - vector[0][1]
    run = vector[1][0] - vector[0][0]
    if rise == 0:
        return 0
    elif run == 0:
        return 90
    else:
        return rise / run

def segment_to_vec(segment):
    vector = [
        segment[1][0] - segment[0][0], segment[1][1] - segment[0][1]
    ]
    return vector


def get_angle(vector1, vector2):
    '''
        Calculates an angle between two vectors, represented as coordinates.
    '''
    v1 = segment_to_vec(vector1)
    v2 = segment_to_vec(vector2)
    dot = v1[0] * v2[0] + v1[1] * v2[1]
    det = v1[0] * v2[1] - v1[1] * v2[0]
    angle = math.atan2(det, dot)
    return 1 * angle * 180 / 3.14

if __name__ == "__main__":
    vector1 = [[-1000, 1000], [-500, -500]]
    vector2 = [[0, 0], [950, 70]]
    print(get_angle(vector1, vector2))