import React, { useState } from 'react';
import { Department } from '../types';

interface DepartmentTreeSelectorProps {
    departments: Department[];
    selectedDepartmentId: number | null;
    onSelect: (departmentId: number) => void;
    disabled?: boolean;
}

// Рекурсивная функция для построения дерева департаментов
const buildDepartmentTree = (departments: Department[]): Department[] => {
    const departmentMap = new Map<number, Department>();
    const rootDepartments: Department[] = [];

    // Создаем копии департаментов с пустыми массивами children
    departments.forEach(dept => {
        departmentMap.set(dept.id, { ...dept, children: [] });
    });

    // Строим дерево
    departments.forEach(dept => {
        const deptCopy = departmentMap.get(dept.id)!;
        if (dept.parentId && departmentMap.has(dept.parentId)) {
            const parent = departmentMap.get(dept.parentId)!;
            if (!parent.children) parent.children = [];
            parent.children.push(deptCopy);
        } else {
            rootDepartments.push(deptCopy);
        }
    });

    return rootDepartments;
};

// Компонент для отображения узла дерева
const DepartmentNode: React.FC<{
    department: Department;
    selectedId: number | null;
    onSelect: (id: number) => void;
    level: number;
}> = ({ department, selectedId, onSelect, level }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = department.children && department.children.length > 0;
    const isSelected = department.id === selectedId;

    return (
        <div className="select-none">
            <div
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    isSelected
                        ? 'bg-primary text-white'
                        : 'hover:bg-white/10'
                }`}
                style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
                onClick={() => onSelect(department.id)}
            >
                {hasChildren && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="w-4 h-4 flex items-center justify-center text-white/60 hover:text-white"
                    >
                        {isExpanded ? '▼' : '▶'}
                    </button>
                )}
                {!hasChildren && <span className="w-4" />}
                <span className="flex-1 text-sm">{department.name}</span>
            </div>
            {hasChildren && isExpanded && (
                <div>
                    {department.children!.map(child => (
                        <DepartmentNode
                            key={child.id}
                            department={child}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const DepartmentTreeSelector: React.FC<DepartmentTreeSelectorProps> = ({
    departments,
    selectedDepartmentId,
    onSelect,
    disabled = false
}) => {
    const tree = buildDepartmentTree(departments);

    if (disabled) {
        const selectedDept = departments.find(d => d.id === selectedDepartmentId);
        return (
            <div className="w-full p-2 bg-white/5 border border-white/20 rounded-md text-white/60">
                {selectedDept?.name || 'Не выбрано'}
            </div>
        );
    }

    return (
        <div className="w-full max-h-60 overflow-y-auto p-2 bg-white/5 border border-white/20 rounded-md text-white">
            {tree.length === 0 ? (
                <div className="text-white/60 text-sm">Нет доступных департаментов</div>
            ) : (
                tree.map(dept => (
                    <DepartmentNode
                        key={dept.id}
                        department={dept}
                        selectedId={selectedDepartmentId}
                        onSelect={onSelect}
                        level={0}
                    />
                ))
            )}
        </div>
    );
};

export default DepartmentTreeSelector;
