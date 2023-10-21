document.addEventListener("DOMContentLoaded", function() {
    // 初始化数据
    const pkData = {
        name: "",
        groups: [],
        opponents: [],
        pk_groups: {}
    };

    // 获取页面上的元素
    const nameInput = document.getElementById("name");
    const groupsInput = document.getElementById("groups");
    const groupContainer = document.getElementById("groupContainer");
    const item_idInput = document.getElementById("item_id");
    const pk_groupSelect = document.getElementById("pk_group");
    const opponentContainer = document.getElementById("opponentContainer");
    const commandResultTextarea = document.getElementById("commandResult");
    const copyCommandButton = document.getElementById("copyCommand");

    const opponentGroupSelects = [pk_groupSelect];

    let currentGroupId = 65;
    let currentOpponentId = 65;

    // 监听新建分组按钮点击事件
    document.getElementById("addGroup").addEventListener("click", function() {
        const id = String.fromCharCode(currentGroupId);
        const group = {};
        currentGroupId++;
        pkData.pk_groups[id] = group;
        createGroupInput(id, group);
        updateAllGroupSelect();
    });

    // 监听新建对手按钮点击事件
    document.getElementById("addOpponent").addEventListener("click", function() {
        const opponent = {
            id: String.fromCharCode(currentOpponentId)
        };
        currentOpponentId++;
        pkData.opponents.push(opponent);
        createOpponentInput(opponent);
    });

    // 监听生成指令按钮点击事件
    document.getElementById("generateCommand").addEventListener("click", function() {
        const pkDataCopy = JSON.parse(JSON.stringify(pkData));

        pkDataCopy.name = nameInput.value;
        if (!groupsInput.value) {
            alert("请输入进行 PK 的群号");
            return;
        } else if (!item_idInput.value) {
            alert("请输入进行 PK 的商品 ID");
            return;
        }
        pkDataCopy.groups = groupsInput.value.split(",").map(group => parseInt(group.trim()));

        if (pk_groupSelect.value !== "0") {
            pkDataCopy.pk_group = pk_groupSelect.value;
        }

        if (Object.keys(pkDataCopy.pk_groups).length === 0) {
            delete pkDataCopy.pk_groups;
        } else {
            for (const groupId in pkDataCopy.pk_groups) {
                if (pkDataCopy.pk_groups.hasOwnProperty(groupId)) {
                    const groupInput = document.getElementById(`group_${groupId}`);
                    pkDataCopy.pk_groups[groupId].title = groupInput.querySelector(".group-title").value;
                    pkDataCopy.pk_groups[groupId].coefficient = parseFloat(groupInput.querySelector(".group-coefficient").value);
                }
            }
        }

        if (pkDataCopy.opponents.length === 0) {
            alert("请添加对手");
            return;
        }
        for (let i = 0; i < pkDataCopy.opponents.length; i++) {
            const opponent = pkDataCopy.opponents[i];
            const opponentInput = document.getElementById(`opponent_${opponent.id}`);
            opponent.name = opponentInput.querySelector(".opponent-name").value;
            opponent.item_id = opponentInput.querySelector(".opponent-item-id").value.split(",").map(item => parseInt(item.trim()));
            const selectedGroup = opponentInput.querySelector(".opponent-group").value;

            if (opponent.item_id.some(isNaN)) {
                alert(`对手 ${opponent.name} 的商品 ID 异常`);
                return;
            }

            if (selectedGroup !== "0") {
                opponent.pk_group = selectedGroup;
            }

            delete opponent.id;
        }

        const commandString = `/pk 新建 ${JSON.stringify(pkDataCopy)}`;
        commandResultTextarea.value = commandString;
    });

    // 监听复制指令按钮点击事件
    copyCommandButton.addEventListener("click", function() {
        commandResultTextarea.select();
        document.execCommand("copy");
    });

    // 更新分组选择框
    function updateGroupSelect(selector) {
        if (!selector) {
            return;
        }

        selector.innerHTML = '<option value="0">无</option>';
        for (const groupId in pkData.pk_groups) {
            if (pkData.pk_groups.hasOwnProperty(groupId)) {
                const option = document.createElement("option");
                option.value = groupId;
                option.textContent = pkData.pk_groups[groupId].title || "未命名组";
                selector.appendChild(option);
            }
        }
    }

    // 更新所有分组选择框
    function updateAllGroupSelect() {
        // 存储当前选中的选项的 ID
        const selectedIds = [];
        opponentGroupSelects.forEach(opponentGroupSelect => {
            selectedIds.push(opponentGroupSelect.value);
            updateGroupSelect(opponentGroupSelect);
        });

        // 在更新后重新选择之前选中的选项
        opponentGroupSelects.forEach((opponentGroupSelect, index) => {
            const selectedId = selectedIds[index];
            if (selectedId && opponentGroupSelect.querySelector(`[value="${selectedId}"]`)) {
                opponentGroupSelect.value = selectedId;
            }
        });
    }

    // 动态生成分组输入字段
    function createGroupInput(groupId, group) {
        const div = document.createElement("div");
        div.id = `group_${groupId}`;
        div.classList.add("group-element");
        div.innerHTML = `
            <input class="group-title" type="text" placeholder="分组名称" value="">
            <input class="group-coefficient" type="number" placeholder="进度系数" value="1">
			<button class="delete-group"><i class="fas fa-trash"></i></button>
		`;

        const titleInput = div.querySelector(".group-title");
        titleInput.addEventListener("input", function() {
            group.title = titleInput.value;
            updateAllGroupSelect();
        });

        const deleteButton = div.querySelector(".delete-group");
        deleteButton.addEventListener("click", function() {
            delete pkData.pk_groups[groupId];
            div.parentNode.removeChild(div);
            updateAllGroupSelect();
        });

        groupContainer.appendChild(div);
    }

    // 动态生成对手输入字段
    function createOpponentInput(opponent) {
        const div = document.createElement("div");
        div.id = `opponent_${opponent.id}`;
        div.classList.add("opponent-element");
        div.innerHTML = `
			<input class="opponent-name" type="text" placeholder="对手名">
			<input class="opponent-item-id" type="text" placeholder="商品IDs">
			<select class="opponent-group"></select>
			<button class="delete-opponent"><i class="fas fa-trash"></i></button>
		`;

        const opponentGroupSelect = div.querySelector(".opponent-group");
        opponentGroupSelects.push(opponentGroupSelect); // 将选择框添加到数组
        updateGroupSelect(opponentGroupSelect);

        const deleteButton = div.querySelector(".delete-opponent");
        deleteButton.addEventListener("click", function() {
            pkData.opponents = pkData.opponents.filter(op => op.id !== opponent.id);
            div.parentNode.removeChild(div);
        });
        opponentContainer.appendChild(div);
    }

    // 初始更新分组选择框
    updateAllGroupSelect();
});