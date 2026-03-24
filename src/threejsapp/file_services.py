import os
import ezdxf

def read_file(dxf_file):
    # save file
    with open(os.getcwd() + "/media/threejsapp/dxf/1.dxf", "wb") as f:
        f.write(dxf_file.read())
    # read file
    doc = ezdxf.readfile(os.getcwd() + "/media/threejsapp/dxf/1.dxf")
    msp = doc.modelspace()
    result_points = msp.query('LWPOLYLINE[layer=="trafficflow"]i')
    result_circles = msp.query('CIRCLE[layer=="trafficflow"]i')
    list_of_actions = []
    id_counter = 0
    for i in range(len(result_points)):
        path = result_points[i]
        for j in range(len(path)):
            new_point = path[j]
            var_action = {
                "id" : id_counter,
                "action" : "move",
                "x" : new_point[0],
                "y" : new_point[1],
                "prev_point" : id_counter - 1
            }
            list_of_actions.append(var_action)
            id_counter += 1
            for k in range(len(result_circles)):
                circle_x = result_circles[k].dxf.center[0]
                circle_y = result_circles[k].dxf.center[1]
                if new_point[0] == circle_x and new_point[1] == circle_y:
                    var_action = {
                        "id" : id_counter,
                        "action" : "serve",
                        "x" : circle_x,
                        "y" : circle_y,
                        "prev_point" : id_counter - 1
                    }
                    list_of_actions.append(var_action)
                    break
            id_counter += 1
    return list_of_actions
