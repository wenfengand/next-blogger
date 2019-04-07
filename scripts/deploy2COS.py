import os 
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client

from secret import appId, secretId, secretKey, region,  bucket
token = None                # 使用临时密钥需要传入 Token，默认为空，可不填
scheme = 'https'            # 指定使用 http/https 协议来访问 COS，默认为 https，可不填
config = CosConfig(Region=region, SecretId=secretId, SecretKey=secretKey, Token=token, Scheme=scheme)
# 2. 获取客户端对象
client = CosS3Client(config)

def deploy_static(upload_dir):
    # TODO 获取本文件地址反推dist地址，确保不同机器也可以运行，任何位置都可以运行
    # TODO 使用栈遍历目录文件
    cos_path = ''
    for parent_folder in os.listdir(upload_dir):
        parent_path = os.path.join(upload_dir, parent_folder)
        
        for file_name in os.listdir(parent_path):
            cos_path = os.path.join('static', parent_folder, file_name)
            real_path = os.path.join(parent_path, file_name)
            print('Processing %s' %real_path)
            print('Uploading to', cos_path)
            with open(real_path, 'rb') as f:
                content = f.read()
                saveCOS(content, cos_path)
def deploy_index(index_file_path, target_folders):
    with open(index_file_path, 'rb') as f:
        content = f.read()
    for folder in target_folders:
        saveCOS(content, folder + '/index.html')
    print('deploy vue index.html done!')
        
def saveCOS(data, path):
    if type(data) == str:
        data = data.encode('utf8') 
    
    response = client.put_object(
        Bucket=bucket,
        Body=data,
        Key=path,
        EnableMD5=False
    )
    return response['ETag']

if __name__ == "__main__":
    target_folders = [
        '/',
        'article',
        'list',
        'categories',
        'admin',
        'admin/article/publish',
        'admin/article/manage',
        'admin/article/drafts',
        'admin/article/deleted',
        'home'
    ]
    deploy_static('../dist/static')
    deploy_index('../dist/index.html', target_folders)