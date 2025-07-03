[
    {
        "node_id": 1,
        "node_type": 1, // 节点类型 1: 提交申请 2: 审核 3:转交
        "title": "申请人",
        "real_name": "申请人名字",
        "operate_time": "2025-06-01 10:10:10"
    },
    {
        "node_id": 2,
        "title": "转交",
        "node_type": 3,
        "content": "管理员xx转交给了xx",
        "operate_time": "2025-06-01 12:10:10"
    },
    {
        "node_id": 3,
        "title": "审批人(2) 任一审批人同意即可",
        "node_type": 2,
        "approval_list": [
            {
                "real_name": "张少飞",
                "approval_name": "审批中", 
                "approval_status": 0, // 审批状态：0审批中，1已通过，2已拒绝，3已撤销

                "comment": "审批备注"
            },
            {
                "real_name": "李立阔",
                "approval_name": "审批中",
                "approval_status": 0,
                "comment": "审批备注"
            }
        ],
        "operate_time": "2025-06-01 13:10:10"
    }
]