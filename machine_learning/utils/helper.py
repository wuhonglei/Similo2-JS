import numpy as np
import os
from pathlib import Path

data_root = str(Path.joinpath(Path(__file__).parent.parent, 'data/score'))

# 文件夹遍历


def get_file_list(dir_path):
    """
    获取文件夹下所有文件的路径
    :param dir_path: 文件夹路径
    :return: 文件路径列表
    """
    file_list = []
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            file_list.append(os.path.join(root, file))
    return file_list


def read_json(filepath):
    """
    读取 json 文件
    :param filepath: 文件路径
    :return: json 数据
    """
    import json
    with open(filepath, 'r') as f:
        data = json.load(f)
    return data


def get_train_data():
    """
    获取训练数据
    """
    file_list = get_file_list(data_root)
    total = len(file_list)
    x_train = np.zeros(
        (total, 2000, 14), dtype=np.float32)  # total 个样本, 每个样本 2000 候选元素，每个元素 14 个特征
    y_train = np.zeros((total, 14), dtype=np.float32)
    for i, file in enumerate(file_list):
        candidate = read_json(file)
        x_train[i, 0:len(candidate), :] = candidate

        index = int(Path(file).stem)
        y_train[i, :] = candidate[index]

    return x_train, y_train
