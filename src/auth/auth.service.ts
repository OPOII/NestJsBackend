import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private userModel:Model<User>
  ){}

  create(createUserDto: CreateAuthDto):Promise<User>{
    
    try {
      const newUser=new this.userModel(createUserDto);
      return  newUser.save();
      
    } catch (error) {
      if(error.code===11000){
        throw new BadRequestException(`${createUserDto.email} already exist`);
      }
      throw new InternalServerErrorException('Something terrible happened');
      console.log(error.code)
    }

  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
