import Vector2D from 'math/vector2d';
import Matrix3x3 from 'math/matrix3x3';
import Component, { ComponentType } from 'core/component';
import EntityManager from 'core/entity-manager';

/**
 * Position, rotation and scale of an entity.
 *
 * @class Transform
 */
class Transform extends Component {
  public localPosition: Vector2D;
  public localRotation: number;
  public localScale: Vector2D;

  private entityManager: EntityManager | null = null;
  private entity: string | null = null;

  constructor(
    localPosition: [number, number] = [0, 0],
    localRotation: number = 0,
    localScale: [number, number] = [1, 1],
  ) {
    super();

    this.localPosition = new Vector2D(localPosition[0], localPosition[1]);
    this.localRotation = localRotation;
    this.localScale = new Vector2D(localScale[0], localScale[1]);
  }

  onAttach_INTERNAL(entityManager: EntityManager, entity: string) {
    this.entityManager = entityManager;
    this.entity = entity;
  }

  addChildren(isWorldPositionPreserved: boolean, ...children: string[]) {
    for (let i = 0; i < children.length; i++) {
      this.entityManager!.getComponent(children[i], Transform)!.setParent(this.entity!, isWorldPositionPreserved);
    }
  }

  setParent(parent: string, isWorldPositionPreserved: boolean = true) {
    const x = this.position.x;
    const y = this.position.y;
    
    this.entityManager!.setParentOfEntity(this.entity!, parent);

    if (isWorldPositionPreserved) {
      this.position.x = x;
      this.position.y = y;
    }
  }

  getAttributes() {
    return {
      allowMultiple: false,
      requires: <ComponentType[]>[],
    };
  }

  /**
   * Position of an entity.
   *
   * @memberof Transform
   */
  get position(): Vector2D {
    const self = this;

    return new Proxy(this.localPosition, {
      get(target, p: 'x' | 'y') {
        return (self.parent?.localToWorldMatrix.multiplyVector2(target) ?? target)[p];
      },
      set(target, p: 'x' | 'y', value) {
        switch (p) {
        case 'x':
          target.x = self.parent?.worldToLocalMatrix
            .multiplyVector2(new Vector2D(value, 0)).x ?? value;
          break;
        case 'y':
          target.y = self.parent?.worldToLocalMatrix
            .multiplyVector2(new Vector2D(0, value)).y ?? value;
          break;
        }

        return true;
      },
    });
  }

  /**
   * Position of an entity.
   *
   * @memberof Transform
   */
  set position(value: Vector2D) {
    const localValue = this.parent?.worldToLocalMatrix.multiplyVector2(value) ?? value;

    this.localPosition.x = localValue.x;
    this.localPosition.y = localValue.y;
  }

  /**
   * Rotation of an entity.
   *
   * @memberof Transform
   */
  get rotation(): number {
    return this.localRotation + (this.parent?.rotation || 0);
  }

  /**
   * Rotation of an entity.
   *
   * @memberof Transform
   */
  set rotation(value: number) {
    this.localRotation = value - (this.parent?.rotation || 0);
  }

  /**
   * Scale of an entity.
   *
   * @memberof Transform
   */
  get scale(): Vector2D {
    const self = this;

    return new Proxy(this.localScale, {
      get(target, p: 'x' | 'y') {
        return Vector2D.scale((self.parent?.scale || Vector2D.one), target)[p];
      },
      set(target, p, value) {
        switch (p) {
        case 'x':
          target.x = value / (self.parent?.scale.x || 1);
          break;
        case 'y':
          target.y = value / (self.parent?.scale.y || 1);
          break;
        }

        return true;
      },
    });
  }

  /**
   * Scale of an entity.
   *
   * @memberof Transform
   */
  set scale(value: Vector2D) {
    const offset = this.parent?.scale || Vector2D.one;

    this.localScale.x = value.x / offset.x;
    this.localScale.y = value.y / offset.y;
  }

  /**
   * Matrix that transforms a point from local space into world space.
   *
   * @readonly
   * @memberof Transform
   */
  get localToWorldMatrix(): Matrix3x3 {
    return Matrix3x3.createTRS(this.position, this.rotation, this.scale);
  }

  /**
   * Matrix that transforms a point from world space into local space.
   *
   * @readonly
   * @memberof Transform
   */
  get worldToLocalMatrix(): Matrix3x3 {
    return this.localToWorldMatrix.inverse;
  }

  get parent(): Transform | null {
    if (this.entityManager != null && this.entity != null) {
      const components = Component.getParent<Transform>(this.entityManager, this.entity, Transform);
      return components.length > 0 ? components[0] : null;
    } else {
      return null;
    }
  }
}

export default Transform;
